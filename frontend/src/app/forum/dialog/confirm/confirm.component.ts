import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folderId?: number; commentId?: number; replyId?:number } // Accept both folderId and commentId
  ) {}

confirm():void {
  this.dialogRef.close(true)
}

cancel():void {
  this.dialogRef.close(false)
}
}
