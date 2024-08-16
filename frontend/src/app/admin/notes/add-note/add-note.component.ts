import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FolderService } from '../../../service/folder.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrl: './add-note.component.css'
})
export class AddNoteComponent {
  folderForm!: FormGroup;

  Categories: any[] = [
    { label: 'fertilité', value: 'fertilité', },
    { label: 'cardiologie', value: 'cardiologie', },
    { label: 'santé bébé', value: 'santé bébé', },
    { label: 'génécologie', value: 'génécologie', },
    { label: 'blague/détente', value: 'blague/détente', },
    { label: 'problème de couple', value: 'problème de couple', },
    { label: 'problème familiale', value: 'problème familiale', },
    { label: 'relation sentimental', value: 'relation sentimental', },
    { label: 'autre', value: 'autre', }
  ]


  constructor(
    private fb: FormBuilder,
    private folderService: FolderService,
    private router: Router,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
  ){}

  
  ngOnInit() {
    this.folderForm = this.fb.group({
      category: ['', Validators.required],
      title: ['', Validators.required],
      content: ['', Validators.required],
      uploadedFile: [null],

    });
  }
  
  onSubmit() {
    if (this.folderForm.invalid) {
      return;
    }

    const folderData = new FormData();
    folderData.append('category', this.folderForm.get('category')?.value);
    folderData.append('title', this.folderForm.get('title')?.value);
    folderData.append('content', this.folderForm.get('content')?.value);

    // Only append the file if it exists
    const uploadedFile = this.folderForm.get('uploadedFile')?.value;
    if (uploadedFile) {
      folderData.append('uploadedFile', uploadedFile);
    }

    this.folderService.createAdminNote(folderData).subscribe(
      (response) => {
        this.folderForm.reset();
      //  console.log('my note')
        this.toastrService.success('Poste créé avec succès');
      },
      (error) => {
        // console.error('Error during folder creation:', error);
        this.toastrService.error('Erreur lors de la création');
      }
    );
  }


  chooseImage(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.folderForm.patchValue({
        uploadedFile: fileInput.files[0]
      });
    } else {
      this.folderForm.patchValue({
        uploadedFile: null
      });
    }
  }

}
