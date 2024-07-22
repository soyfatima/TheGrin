// animation.service.ts
import { Injectable } from '@angular/core';
import { trigger, state, style, animate, transition, AnimationTriggerMetadata } from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  getSlideInAnimation(): AnimationTriggerMetadata {
    return trigger('slideIn', [
      state('out', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        style({ transform: 'translateX(40%)' }),
        animate('600ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
    ]);
  }

  getFadeUpAnimation(): AnimationTriggerMetadata {
    return trigger('fadeUp', [
      state('out', style({ opacity: 0, transform: 'translateY(100%)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20%)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]);
  }

  getFadeDownAnimation(): AnimationTriggerMetadata {
    return trigger('fadeDown', [
      state('out', style({ opacity: 0, transform: 'translateY(-100%)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20%)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]);
  }
}
