import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AUTH_CONFIG } from './auth.config';
import * as auth0 from 'auth0-js';

@Injectable()
export class AuthService {

  // Create Auth0 web auth instance
  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token id_token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  });
  userProfile: any;
  loggedIn: boolean;
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);

  constructor(private router: Router) {
    console.log(AUTH_CONFIG.CLIENT_DOMAIN);
    const lsProfile = localStorage.getItem('profile');

    if (this.tokenValid) {
      this.userProfile = JSON.parse(lsProfile);
      this.setLoggedIn(true);
    }
  }

  setLoggedIn(value: boolean) {
    this.loggedIn$.next(value);
    this.loggedIn = value;
  }

  login() {
    debugger;
    this._auth0.authorize();
  }

  handleAuth() {
    this._auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this._getProfile(authResult);
      } else if (err) {
        console.error(`Error authenticating: ${err.error}`);
      }
      this.router.navigate(['/']);
    });
  }

  private _getProfile(authResult) {
    this._auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile);
      } else if (err) {
        console.error(`Error authenticating ${err.error}`);
      }
    });
  }

  private _setSession(authResult, profile) {
    // Save session data
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + Date.now());

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('profile', JSON.stringify(profile));
    this.userProfile = profile;

    this.setLoggedIn(true);
  }

  logout() {
    // Ensure all auth items removed from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('authRedirect');

    // Reset local properties, update loggedIn$ stream
    this.userProfile = undefined;
    this.setLoggedIn(false);
    // Return to homepage
    this.router.navigate(['/']);
  }

  get tokenValid(): boolean {
    const expiresAt = JSON.stringify(localStorage.getItem('expires_at'));
    return Date.now() < parseInt(expiresAt);
  }
}
