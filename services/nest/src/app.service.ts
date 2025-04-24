import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    console.log('Hello from nest.js!');
    return 'Hello from nest.js!';
  }
}
