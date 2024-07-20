import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrl: './top.component.css'
})
export class TopComponent {

  @ViewChild('counter1') counter1!: ElementRef;
  @ViewChild('counter2') counter2!: ElementRef;
  @ViewChild('counter3') counter3!: ElementRef;
  @ViewChild('counter4') counter4!: ElementRef;

  constructor(private renderer: Renderer2) { }

 
  ngAfterViewInit(): void {
    //counter
    this.startCounterAnimation(this.counter1.nativeElement, 0, 70, 4000);
    this.startCounterAnimation(this.counter2.nativeElement, 0, 50, 4000);
    this.startCounterAnimation(this.counter3.nativeElement, 0, 20, 4000);
    this.startCounterAnimation(this.counter4.nativeElement, 0, 30, 4000);
  }

  //counter
  startCounterAnimation(counterElement: HTMLElement, startValue: number, finalValue: number, duration: number) {
    const increment = (finalValue - startValue) / (duration / 16);
    let currentValue = startValue;

    const animateCounter = () => {
      if (currentValue <= finalValue) {
        this.renderer.setProperty(counterElement, 'innerText', Math.ceil(currentValue).toString());
        currentValue += increment;
        setTimeout(animateCounter, 16); 
      } else {
        this.renderer.setProperty(counterElement, 'innerText', finalValue.toString());
      }
    };

    animateCounter();
  }

}
