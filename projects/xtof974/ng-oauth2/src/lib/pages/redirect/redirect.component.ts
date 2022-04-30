import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'redirect',
  template: ` <ng-content></ng-content> `,
})
export class RedirectComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
