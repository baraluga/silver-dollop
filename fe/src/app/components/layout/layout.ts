import { Component } from '@angular/core';
import { ApiStatusComponent } from '../api-status/api-status';

@Component({
  selector: 'app-layout',
  imports: [ApiStatusComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

}
