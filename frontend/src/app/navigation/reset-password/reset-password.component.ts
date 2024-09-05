import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})

export class ResetPasswordComponent {
  dialogRef:any;
  email: string = '';
  resetCode: string = '';
  password: string = '';
  confirmPassword: string = '';
  isResettingPassword: boolean = false;
  isCodeSent: boolean = false;
  isLoading: boolean = false;
  message: string = '';
  isFormVisible: boolean = true;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) { }


  async onRequestReset(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.requestResetCode(this.email).toPromise();
      this.isCodeSent = true;
      this.message = 'Un code vous a été envoyé, veuillez consulter votre boite mail';
      this.toastr.success(this.message);
    } catch (error) {
      let errorMessage = 'Echec de l\'envoi du code. Veuillez réessayer ultérieurement.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.toastr.error(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }


  async verifyCode(): Promise<void> {
    this.isLoading = true;
    try {
      await this.authService.verifyResetCode(this.email, this.resetCode).toPromise();
      this.isResettingPassword = true;
      this.message = '';
    } catch (error) {
      this.toastr.error('Code invalide !');
    } finally {
      this.isLoading = false;
    }
  }

  async onResetPassword(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      this.toastr.error('Les mots de passe ne correspondent pas.');
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.resetPassword(this.email, this.resetCode, this.password).toPromise();
      this.message = 'Votre mot de passe a été réinitialisé .';
      this.toastr.success(this.message);
      this.isFormVisible = false;
    } catch (error) {
      this.toastr.error('Échec de réinitialisation du mot de passe, veuillez réessayer.');
    } finally {
      this.isLoading = false;
    }
  }


  onYesClick():void {
    this.dialogRef.close(true)
  }
}