// Simple in-memory logger for debugging on device
const logs = [];
const MAX_LOGS = 100;

export function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  logs.unshift({ timestamp, message, type });
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
}

export function getLogs() {
  return [...logs];
}

export function clearLogs() {
  logs.length = 0;
}

// Override console.log to capture logs
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  log(message, 'info');
  originalLog.apply(console, args);
};

console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  log(message, 'error');
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  log(message, 'warn');
  originalWarn.apply(console, args);
};
