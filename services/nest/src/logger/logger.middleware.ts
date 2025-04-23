import * as fs from 'fs';
import * as path from 'path';

const logDir = path.resolve(__dirname, '../../../../logs');
fs.mkdirSync(logDir, { recursive: true });

const logFilePath = path.join(__dirname, '../..', 'logs', 'nest.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

function logToFile(level: string, ...args: any[]) {
  const message = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${args.join(' ')}\n`;
  logStream.write(message);
}

['log', 'info', 'warn', 'error'].forEach((level) => {
  const original = console[level as keyof Console] as (...args: any[]) => void;
  (console as any)[level] = (...args: any[]) => {
    logToFile(level, ...args);
    original(...args);
  };
});
