import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FolderService } from '../../service/folder.service';
import { CommentService } from '../../service/comment.service';

@Component({
  selector: 'app-user-folders',
  templateUrl: './user-folders.component.html',
  styleUrl: './user-folders.component.css'
})
export class UserFoldersComponent {

  userId!: number;
  folders: any[] = [];
comments: any [] = []
  constructor(
    private route: ActivatedRoute,
    private folderService: FolderService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadFolders();
      this.UserComment()
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

  UserComment():void{
    this.commentService.getUserComments(this.userId).subscribe(
      (comments:any[]) =>{
        this.comments = comments;
        console.log('user comments', comments)
      }
    )
  }
}
