import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentService } from '../../../service/comment.service';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../service/report.service';

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
    } else if (this.data.replyId) {
        reportData = {
            replyId: this.data.replyId,
            reason: this.selectedReason === 'Other' ? this.customReason : this.selectedReason,
        };
        reportObservable = this.reportService.reportReply(reportData);
    }  else if(this.data.userId) {
        reportData = {
            userId: this.data.userId,
            reason:this.selectedReason ==='Other' ? this.customReason:this.selectedReason,
        } ;
        reportObservable = this.reportService.reportUser(reportData)
    }
    
    else {
        this.toastrService.error('Aucune information à signaler trouvée.');
        return;
    }

    if (!reportObservable) {
        this.toastrService.error('Une erreur est survenue lors de la création du signalement.');
        return;
    }

    reportObservable.subscribe(
        response => {
            this.dialogRef.close(response);
            this.toastrService.success('Rapport soumis avec succès.');
            if (response.shouldDeleteFolder) {
                this.toastrService.info('Le dossier sera supprimé après avoir atteint le seuil de signalement.');
            }
        },
        error => {
            if (error.status === 404) {
                if (error.error.message === 'Ce commentaire a déjà été supprimé.') {
                    this.toastrService.error('Vous ne pouvez pas signaler ce commentaire car il a déjà été supprimé.');
                } else if (error.error.message === 'Ce dossier a déjà été supprimé.') {
                    this.toastrService.error('Vous ne pouvez pas signaler ce dossier car il a déjà été supprimé.');
                } else if (error.error.message === 'This user has already been banned.') {
                    this.toastrService.error('Vous ne pouvez pas signaler cet utilisateur car il a déjà été banni.');
                } else {
                    this.toastrService.error("L'élément que vous essayez de signaler n'existe pas.");
                }
            } else if (error.status === 409) {
                if (this.data.commentId) {
                    this.toastrService.error('Vous avez déjà signalé ce commentaire.');
                } else if (this.data.folderId) {
                    this.toastrService.error('Vous avez déjà signalé ce poste.');
                } else if (this.data.replyId) {
                    this.toastrService.error('Vous avez déjà signalé cette réponse.');
                } else if (this.data.userId) {
                    this.toastrService.error('Vous avez déjà signalé cet utilisateur.');
                }
            } else {
                this.toastrService.error('Une erreur est survenue lors de la soumission du signalement.');
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
