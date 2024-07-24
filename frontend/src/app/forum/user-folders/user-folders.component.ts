import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FolderService } from '../../service/folder.service';

@Component({
  selector: 'app-user-folders',
  templateUrl: './user-folders.component.html',
  styleUrl: './user-folders.component.css'
})
export class UserFoldersComponent {

  userId!: number;
  folders: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private folderService: FolderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadFolders();
    });
  }

  loadFolders(): void {
    this.folderService.getUserFolders(this.userId).subscribe(
      (folders: any[]) => {
        this.folders = folders;
        console.log( 'user folders', folders)
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
  }

}
