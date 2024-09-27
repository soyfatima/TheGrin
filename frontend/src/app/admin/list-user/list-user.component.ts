import { Component } from '@angular/core';
import { userService } from '../../service/user.service';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent {
user:any [] = []
filteredUsers: any[] = [];
searchTerm: string = '';

constructor(private userService:userService){}

ngOnInit() {
this.fetchAllUser()
}

fetchAllUser() {
  this.userService.GetAllUser().subscribe(
    (users) => {
      console.log('user', users)
      this.user = users
      this.filteredUsers = users;
    },
    (error) =>{
      //console.error('Error fetching user data:', error)
    }
  )
}


filterUsers() {
  this.filteredUsers = this.user.filter((u) =>
    u.username.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}


toggleBlockUser(userId: number, currentBlockedState: boolean): void {
  if (userId) {
    const newBlockedState = !currentBlockedState; // Toggle the block state
    this.userService.blockUser(userId, newBlockedState).subscribe(
      () => {
        // Update the UI by finding the specific user and toggling the block state
        const user = this.user.find(u => u.id === userId);
        if (user) {
          user.blocked = newBlockedState;
        }
        const action = newBlockedState ? 'bloqué' : 'débloqué';
      },
      error => {
       // console.error(`Erreur lors du ${newBlockedState ? 'blocage' : 'déblocage'} de l'utilisateur:`, error);
      }
    );
  } else {
    //console.error('ID utilisateur invalide');
  }
}

}
