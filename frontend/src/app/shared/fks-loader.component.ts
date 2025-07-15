import { Component } from '@angular/core';

@Component({
  selector: 'fks-loader',
  standalone: true,
  template: `
    <div class="fks-loader-wrapper">
      <img src="/assets/main/fks-loader.gif" alt="Loading..."/>
    </div>
  `,
  styles: [`
    .fks-loader-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class FksLoaderComponent {} 