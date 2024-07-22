import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../service/auth.service';


@Injectable({
  providedIn:'root'
})

export class LoginGuard implements CanActivate {
  
  public constructor(
    private router: Router,
    private authService: AuthService  // Injectez le service LoginService ici
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
     // this.router.navigateByUrl('/login');
      return false;
    }
    return true;
  }
  
}