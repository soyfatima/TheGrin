import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentService } from '../../service/comment.service';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../service/report.service';

@Component({
  selector: 'app-report-user',
  templateUrl: './report-user.component.html',
  styleUrl: './report-user.component.css'
})
export class ReportUserComponent {

  selectedReason: string = '';
  customReason: string = '';
  reasons = ['Spam', 'Inapproprié', 'Harcélement'];
  showWarning: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ReportUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commentService: CommentService,
    private toastrService: ToastrService,
    private reportService: ReportService

  ) { }

  submitSignal(): void {
    if (!this.isReasonSelected()) {
      this.toastrService.error('Veuillez choisir une raison'); 
      return;
  }
    let reportData;
    let reportObservable;
 
    if (this.data.commentId) {
        reportData = {
            commentId: this.data.commentId,
            reason: this.selectedReason === 'Other' ? this.customReason : this.selectedReason,
        };
        reportObservable = this.reportService.reportComment(reportData);
    } else if (this.data.folderId) {
        reportData = {
            folderId: this.data.folderId,
            reason: this.selectedReason === 'Other' ? this.customReason : this.selectedReason,
        };
        reportObservable = this.reportService.reportFolder(reportData);
    } else {
      //  console.error('Neither commentId nor folderId found.');
        return;
    }
    // Subscribe to the report observable
    reportObservable.subscribe(
        response => {
            this.dialogRef.close(response);
            this.toastrService.success('Report submitted successfully');

            // Optionally, check if the folder is marked for deletion based on response
            if (response.shouldDeleteFolder) {
                this.toastrService.info('The folder will be deleted after reaching the report threshold.');
            }
        },

        
        error => {
          //  console.error('Error reporting item:', error); 
            if (error.status === 404) {
                if (error.error.message === 'This comment has already been deleted.') {
                    this.toastrService.error('You cannot report this comment because it has already been deleted.');
                } else if (error.error.message === 'This folder has already been deleted.') {
                    this.toastrService.error('You cannot report this folder because it has already been deleted.');
                } else {
                    this.toastrService.error('The item you are trying to report does not exist.');
                }
            } else if (error.status === 409) {
                // Conflict error if user already reported the comment or folder
                if (this.data.commentId) {
                    this.toastrService.error('You have already reported this comment.');
                } else if (this.data.folderId) {
                    this.toastrService.error('You have already reported this folder.');
                }
            } else {
                this.toastrService.error('An error occurred while submitting the report.');
            }
        }
    );

}

isReasonSelected(): boolean {
  return !!(this.selectedReason && (this.selectedReason !== 'Other' || this.customReason));
}

  closeSignalModal(): void {
    this.dialogRef.close();
  }
}
