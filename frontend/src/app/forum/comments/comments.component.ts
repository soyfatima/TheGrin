import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {

  @Input() selectedCard: any;
  @Input() comments: any[] = [];
  @Input() loggedInUserId: string = '';
}
