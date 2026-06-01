import { Filesystem } from '@capacitor/filesystem';

const LOG_FILE = 'error-log.txt';

async function writeLog(message) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      // Try to append to existing file
      await Filesystem.appendFile({
        path: LOG_FILE,
        data: logEntry,
        directory: 'Documents',
      });
    } catch (appendErr) {
      // If file doesn't exist, create it
      if (appendErr.message?.includes('File does not exist')) {
        await Filesystem.writeFile({
          path: LOG_FILE,
          data: logEntry,
          directory: 'Documents',
        });
      } else {
        throw appendErr;
      }
    }
  } catch (err) {
    // If logging fails, at least log to console
    console.error('Failed to write to error log:', err);
  }
}

export async function logError(error, context = '') {
  const message = context 
    ? `ERROR [${context}]: ${error.message || error}\nStack: ${error.stack || 'No stack trace'}`
    : `ERROR: ${error.message || error}\nStack: ${error.stack || 'No stack trace'}`;
  
  await writeLog(message);
  console.error(message);
}

export async function logInfo(message) {
  await writeLog(`INFO: ${message}`);
  console.log(message);
}

export async function logStep(step, message) {
  await writeLog(`STEP [${step}]: ${message}`);
  console.log(`[${step}] ${message}`);
}

export async function getLogs() {
  try {
    const result = await Filesystem.readFile({
      path: LOG_FILE,
      directory: 'Documents',
    });
    return result.data;
  } catch (err) {
    return `Failed to read logs: ${err.message}`;
  }
}

export async function clearLogs() {
  try {
    await Filesystem.deleteFile({
      path: LOG_FILE,
      directory: 'Documents',
    });
  } catch (err) {
    console.error('Failed to clear logs:', err);
  }
}
