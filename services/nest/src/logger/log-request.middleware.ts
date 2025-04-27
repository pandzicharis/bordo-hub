import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logStream;

  constructor() {
    const logDir = path.resolve(__dirname, '../../../../logs');
    fs.mkdirSync(logDir, { recursive: true });

    const logFilePath = path.join(logDir, 'nest.log');
    this.logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, params } = req;
    const startTime = Date.now();

    const oldSend = res.send.bind(res);

    let responseBody: any;

    res.send = (body: any) => {
      responseBody = body;
      return oldSend(body);
    };

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      const logEntry = {
        timestamp: new Date().toISOString(),
        method,
        url: originalUrl,
        query,
        params,
        requestBody: body,
        responseBody: this.tryParseJson(responseBody),
        statusCode,
        responseTime: `${responseTime}ms`,
      };

      const logMessage = JSON.stringify(logEntry) + '\n';
      this.logStream.write(logMessage);

      console.log(logEntry);
    });

    next();
  }

  private tryParseJson(body: any) {
    try {
      if (typeof body === 'string') {
        return JSON.parse(body);
      }
      return body;
    } catch {
      return body;
    }
  }
}
