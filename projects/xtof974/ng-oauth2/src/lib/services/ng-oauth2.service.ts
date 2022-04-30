import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject, timer } from 'rxjs';
import {
  Config,
  OAuth,
  REGEX_ACCESS_TOKEN,
  REGEX_EXPIRES_IN,
  Token,
} from '../models/auth.model';
import { AuthService } from './auth.service';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NgOauth2Service {
  private _expires_in = new Subject<number>();
  expires_in$ = this._expires_in.asObservable();
  expires_in: number;

  constructor(
    private authService: AuthService,
    private location: Location,
    private router: Router,
    @Inject('config') private environment: Config
  ) {
    this.expires_in$
      .pipe(
        map((expires_in) => {
          this.expires_in =
            expires_in - this.environment.extras.delayBeforeRefreshToken;
          return this.expires_in;
        }),
        switchMap((expires_in) => {
          // if REFRESH_TOKEN
          if (this.authService.getRefreshToken()) {
            //console.log('WITH REFRESH TOKEN');
            return timer(expires_in * 1000).pipe(
              switchMap((_) => this.authService.updateRefreshToken())
            );
          } else {
            //console.log('WITHOUT REFRESH TOKEN');
            return timer(expires_in * 1000).pipe(
              tap(
                () => {
                  this.authService.initFlow(this.environment.flowType);
                },
                map(() => of(null))
              )
            );
          }
        })
      )
      .subscribe((refresh_token_response) => {
        //console.log(refresh_token_response);
        if (refresh_token_response) {
          const expires_in = (refresh_token_response as Token).expires_in;
          this.authService.setToken(
            (refresh_token_response as Token).access_token,
            expires_in
          );
          this._expires_in.next(expires_in);
        }
      });
  }

  init(isActive: boolean = true): Promise<Boolean> {
    //console.log('Service Oauth2Flow INIT');
    if (!isActive) {
      //console.log('TURN OFF Service Oauth2Flow');
      return Promise.resolve(true);
    }
    return new Promise<Boolean>((resolve, reject) => {
      //console.log('TURN ON Service Oauth2Flow');
      const location_href = window.location.href;

      // Entry point Flows
      if (this.authService.getToken() === OAuth.TOKEN_UNSET) {
        this.authService.initFlow(this.environment.flowType);
      }

      if (
        location_href.includes(this.environment.redirectInfos.redirectURI) &&
        this.authService.getToken() == OAuth.ASK_TOKEN
      ) {
        // catch ACCESS TOKEN (Implicit Grant Flow)
        const token_array = location_href.match(REGEX_ACCESS_TOKEN);
        if (token_array) {
          const expires_in = location_href
            .match(REGEX_EXPIRES_IN)[0]
            .split(`${OAuth.EXPIRES_IN}=`)[1];
          const token = token_array[0].split(`${OAuth.ACCESS_TOKEN}=`)[1];
          this.authService.setToken(token, parseInt(expires_in));
          this.redirect();
        }
        // catch CODE and ASK for ACCESS TOKEN (PKCE Flow)
        this.authService
          .getCodeAndAskToken(location_href, this.environment.flowType)
          .then((_) => this.redirect());
      }

      if (this.environment.extras.saveNavigation) {
        this.saveNavigation();
      }

      const tokenStatus = this.authService.getToken();
      if (
        tokenStatus !== OAuth.TOKEN_UNSET &&
        tokenStatus !== OAuth.ASK_TOKEN
      ) {
        const expire_in = this.authService.getExpiresIn();
        if (expire_in) {
          //console.log('_expires_in', expire_in);
          this._expires_in.next(parseInt(expire_in));
        }
        setTimeout(() => {
          //console.log('Service Oauth2Flow FINISHED');
          resolve(true);
        }, 1000);
      }
    });
  }

  private saveNavigation() {
    this.router.events.subscribe((val) => {
      const path = this.location.path();
      if (path != '') {
        if (!this.environment.redirectInfos.redirectURI.includes(path)) {
          sessionStorage.setItem('home', path);
        }
      } else {
        sessionStorage.setItem('home', this.environment.redirectInfos.home);
      }
    });
  }

  private redirect() {
    const home =
      sessionStorage.getItem('home') || this.environment.redirectInfos.home;
    home
      ? (window.location.href = `${origin}${home}`)
      : (window.location.href = `${origin}`);
  }
}
