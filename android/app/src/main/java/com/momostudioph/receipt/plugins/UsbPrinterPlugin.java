package com.momostudioph.receipt.plugins;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.HashMap;
import java.util.Map;

@CapacitorPlugin(name = "UsbPrinter")
public class UsbPrinterPlugin extends Plugin {

    private static final String TAG = "UsbPrinterPlugin";
    private static final String ACTION_USB_PERMISSION = "com.momostudioph.receipt.USB_PERMISSION";
    private static final int BULK_TRANSFER_TIMEOUT_MS = 5000;
    private static final int WRITE_CHUNK_SIZE = 16384;

    private UsbManager usbManager;
    private UsbDevice activeDevice;
    private UsbDeviceConnection activeConnection;
    private UsbEndpoint bulkOutEndpoint;

    private PluginCall pendingPermissionCall;

    private final BroadcastReceiver usbPermissionReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {
                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    boolean granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false);

                    if (pendingPermissionCall != null) {
                        JSObject result = new JSObject();
                        result.put("granted", granted);
                        if (device != null) {
                            result.put("deviceName", device.getDeviceName());
                        }
                        if (granted) {
                            pendingPermissionCall.resolve(result);
                        } else {
                            pendingPermissionCall.reject("USB permission denied by user", "PERMISSION_DENIED");
                        }
                        pendingPermissionCall = null;
                    }
                }
            }
        }
    };

    @Override
    public void load() {
        usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);

        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(usbPermissionReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(usbPermissionReceiver, filter);
        }
    }

    @Override
    protected void handleOnDestroy() {
        try {
            getContext().unregisterReceiver(usbPermissionReceiver);
        } catch (Exception ignored) {}
        disconnectInternal();
    }

    @PluginMethod
    public void scanDevices(PluginCall call) {
        try {
            if (usbManager == null) {
                call.reject("USB Manager not available", "USB_UNAVAILABLE");
                return;
            }

            HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
            JSArray devices = new JSArray();

            for (Map.Entry<String, UsbDevice> entry : deviceList.entrySet()) {
                UsbDevice device = entry.getValue();
                JSObject info = new JSObject();
                info.put("name", device.getDeviceName());
                info.put("vendorId", device.getVendorId());
                info.put("productId", device.getProductId());
                info.put("deviceClass", device.getDeviceClass());
                info.put("manufacturerName", device.getManufacturerName() != null ? device.getManufacturerName() : "");
                info.put("productName", device.getProductName() != null ? device.getProductName() : "");
                info.put("hasPermission", usbManager.hasPermission(device));
                devices.put(info);
            }

            JSObject result = new JSObject();
            result.put("devices", devices);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "scanDevices error", e);
            call.reject("Failed to scan USB devices: " + e.getMessage(), "SCAN_ERROR");
        }
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        String deviceName = call.getString("deviceName");
        if (deviceName == null || deviceName.isEmpty()) {
            call.reject("deviceName is required", "INVALID_PARAM");
            return;
        }

        try {
            HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
            UsbDevice device = deviceList.get(deviceName);

            if (device == null) {
                call.reject("Device not found: " + deviceName, "DEVICE_NOT_FOUND");
                return;
            }

            if (usbManager.hasPermission(device)) {
                JSObject result = new JSObject();
                result.put("granted", true);
                result.put("deviceName", deviceName);
                call.resolve(result);
                return;
            }

            pendingPermissionCall = call;

            int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                    ? PendingIntent.FLAG_IMMUTABLE
                    : 0;
            PendingIntent permissionIntent = PendingIntent.getBroadcast(
                    getContext(), 0, new Intent(ACTION_USB_PERMISSION), flags);
            usbManager.requestPermission(device, permissionIntent);
        } catch (Exception e) {
            Log.e(TAG, "requestPermission error", e);
            call.reject("Permission request failed: " + e.getMessage(), "PERMISSION_ERROR");
        }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String deviceName = call.getString("deviceName");
        if (deviceName == null || deviceName.isEmpty()) {
            call.reject("deviceName is required", "INVALID_PARAM");
            return;
        }

        try {
            disconnectInternal();

            HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
            UsbDevice device = deviceList.get(deviceName);

            if (device == null) {
                call.reject("Device not found: " + deviceName, "DEVICE_NOT_FOUND");
                return;
            }

            if (!usbManager.hasPermission(device)) {
                call.reject("No USB permission for device. Call requestPermission first.", "NO_PERMISSION");
                return;
            }

            UsbDeviceConnection connection = usbManager.openDevice(device);
            if (connection == null) {
                call.reject("Failed to open USB device", "OPEN_FAILED");
                return;
            }

            UsbEndpoint outEndpoint = findBulkOutEndpoint(device, connection);
            if (outEndpoint == null) {
                connection.close();
                call.reject("No bulk-OUT endpoint found on device", "ENDPOINT_NOT_FOUND");
                return;
            }

            activeDevice = device;
            activeConnection = connection;
            bulkOutEndpoint = outEndpoint;

            JSObject result = new JSObject();
            result.put("connected", true);
            result.put("deviceName", deviceName);
            result.put("productName", device.getProductName() != null ? device.getProductName() : "");
            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "connect error", e);
            disconnectInternal();
            call.reject("Connection failed: " + e.getMessage(), "CONNECT_ERROR");
        }
    }

    @PluginMethod
    public void write(PluginCall call) {
        String dataBase64 = call.getString("data");
        if (dataBase64 == null || dataBase64.isEmpty()) {
            call.reject("data (base64) is required", "INVALID_PARAM");
            return;
        }

        if (activeConnection == null || bulkOutEndpoint == null) {
            call.reject("Printer not connected. Call connect() first.", "NOT_CONNECTED");
            return;
        }

        try {
            byte[] payload = Base64.decode(dataBase64, Base64.DEFAULT);
            int totalSent = 0;
            int offset = 0;

            while (offset < payload.length) {
                int chunkLen = Math.min(WRITE_CHUNK_SIZE, payload.length - offset);
                byte[] chunk = new byte[chunkLen];
                System.arraycopy(payload, offset, chunk, 0, chunkLen);

                int sent = activeConnection.bulkTransfer(bulkOutEndpoint, chunk, chunkLen, BULK_TRANSFER_TIMEOUT_MS);
                if (sent < 0) {
                    throw new Exception("bulkTransfer returned error at offset " + offset);
                }

                totalSent += sent;
                offset += chunkLen;
            }

            JSObject result = new JSObject();
            result.put("bytesSent", totalSent);
            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "write error", e);
            disconnectInternal();
            call.reject("Write failed — printer may be disconnected: " + e.getMessage(), "WRITE_ERROR");
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        disconnectInternal();
        JSObject result = new JSObject();
        result.put("disconnected", true);
        call.resolve(result);
    }

    @PluginMethod
    public void isConnected(PluginCall call) {
        JSObject result = new JSObject();
        result.put("connected", activeConnection != null && bulkOutEndpoint != null);
        call.resolve(result);
    }

    private void disconnectInternal() {
        try {
            if (activeConnection != null) {
                activeConnection.close();
            }
        } catch (Exception e) {
            Log.w(TAG, "Error closing USB connection", e);
        } finally {
            activeConnection = null;
            activeDevice = null;
            bulkOutEndpoint = null;
        }
    }

    private UsbEndpoint findBulkOutEndpoint(UsbDevice device, UsbDeviceConnection connection) {
        for (int i = 0; i < device.getInterfaceCount(); i++) {
            UsbInterface iface = device.getInterface(i);
            boolean claimed = connection.claimInterface(iface, true);
            if (!claimed) continue;

            for (int j = 0; j < iface.getEndpointCount(); j++) {
                UsbEndpoint endpoint = iface.getEndpoint(j);
                if (endpoint.getType() == UsbConstants.USB_ENDPOINT_XFER_BULK
                        && endpoint.getDirection() == UsbConstants.USB_DIR_OUT) {
                    return endpoint;
                }
            }
        }
        return null;
    }
}
