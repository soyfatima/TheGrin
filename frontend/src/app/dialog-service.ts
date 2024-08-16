import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { OnConfirmComponent } from './admin/dialog/on-confirm/on-confirm.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(public dialog: MatDialog) {}

  openDialog(data: any): Observable<boolean> {
    const dialogRef = this.dialog.open(OnConfirmComponent, {
      width: '300px',
      height:'150px',
      data: { data },
    });

    return dialogRef.afterClosed();
  }
}
