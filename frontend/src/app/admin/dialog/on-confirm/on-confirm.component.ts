import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-on-confirm',
  templateUrl: './on-confirm.component.html',
  styleUrl: './on-confirm.component.css'
})
export class OnConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<OnConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastrService: ToastrService,

  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
   // this.toastrService.success('Supprimé avec succès !');
  }

  onCancel(): void {
    this.dialogRef.close(false);

  }

}