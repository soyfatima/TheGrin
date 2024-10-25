import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../service/auth.service";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";

// admin.guard.ts
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isAdmin = this.authService.isAdmin();
  
    if (isAdmin) {
      return true;
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
  
}