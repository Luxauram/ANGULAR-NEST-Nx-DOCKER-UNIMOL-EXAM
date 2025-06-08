/* eslint-disable @angular-eslint/component-selector */
import { Component } from '@angular/core';
import { BadgeComponent } from './tags.component';

// Badge Grigio
@Component({
  selector: 'badge-gray',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="gray"><ng-content></ng-content></app-badge>',
})
export class BadgeGrayComponent {}

// Badge Rosso
@Component({
  selector: 'badge-red',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="red"><ng-content></ng-content></app-badge>',
})
export class BadgeRedComponent {}

// Badge Giallo
@Component({
  selector: 'badge-yellow',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="yellow"><ng-content></ng-content></app-badge>',
})
export class BadgeYellowComponent {}

// Badge Verde
@Component({
  selector: 'badge-green',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="green"><ng-content></ng-content></app-badge>',
})
export class BadgeGreenComponent {}

// Badge Blu
@Component({
  selector: 'badge-blue',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="blue"><ng-content></ng-content></app-badge>',
})
export class BadgeBlueComponent {}

// Badge Indaco
@Component({
  selector: 'badge-indigo',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="indigo"><ng-content></ng-content></app-badge>',
})
export class BadgeIndigoComponent {}

// Badge Viola
@Component({
  selector: 'badge-purple',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="purple"><ng-content></ng-content></app-badge>',
})
export class BadgePurpleComponent {}

// Badge Rosa
@Component({
  selector: 'badge-pink',
  standalone: true,
  imports: [BadgeComponent],
  template: '<app-badge variant="pink"><ng-content></ng-content></app-badge>',
})
export class BadgePinkComponent {}
