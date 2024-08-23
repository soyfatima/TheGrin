import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ContactUsComponent } from '../dialog/contact-us/contact-us.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrl: './top.component.css'
})
export class TopComponent {

 
  constructor(private renderer: Renderer2,
    private dialog: MatDialog,

  ) { }

 
 

  //counter
 
  openDialog(): void {
    this.dialog.open(ContactUsComponent, {
      width: '700px',
      data: { }
    });
  
}

}
