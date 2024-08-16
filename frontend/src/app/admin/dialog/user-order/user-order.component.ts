import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-user-order',
  templateUrl: './user-order.component.html',
  styleUrl: './user-order.component.css'
})
export class UserOrderComponent {

  order: any;
  dialogRef: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.order = data;
   // this.order = data ? data.order : null;
  }

  
  onYesClick(): void {
    this.dialogRef.close(true);
  }
}