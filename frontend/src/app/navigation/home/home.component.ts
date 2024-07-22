import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
// import { NgbOffcanvas, NgbOffcanvasConfig } from '@ng-bootstrap/ng-bootstrap';
// import { AuthService } from '../../service/auth.service';
// import { TokenService } from '../../service/tokenservice';
// import { CookieService } from 'ngx-cookie-service';
//import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  public menuIndex: number = 0;
  isNavbarCollapsed = true;
  collapsed = true;
  isNavbarOpen: boolean=false;
  loaderVisible = true;


  constructor(
     private router: Router,
     ) {
  }

  ngOnInit(): void {
    // Toggle Click Function
    $("#menu-toggle").click(function (e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
      $("#content").toggleClass("toggled");
    });
  }

  public switchMemu(index: any) {
    this.menuIndex = index;
  }

 
  // logout(): void {
  //   this.tokenService.removeAuthData();
  //  this.router.navigate(['admin/login']);
  // }

  ngAfterViewInit() {
    this.loader();
  }

  loader() {
    setTimeout(() => {
      this.loaderVisible = false;
    }, 1000); // Modify this delay as needed
  }
}
