import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  Config,
  FlowType,
  OAuth,
  REGEX_CODE,
  Token,
} from '../models/auth.model';
import { AuthUtilService } from './auth.util.service';
import { ResourcesService } from './resources.service';
import { StorageService } from './storage.service';

/* const codeChallenge = 'M3nbtDfXyO73f4uswXy_FD3bPqoBZCrMefTIusXVL_k';
const codeVerifier = '0UFjSaMq2lZ8QFqSJeXKoLTi0Wfcl4XHl5D7GI7M93m'; */

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _setToken$ = new BehaviorSubject<boolean>(false);
  setToken$ = this._setToken$.asObservable();
  codeChallenge: string;
  codeVerifier: string;

  constructor(
    private resourceService: ResourcesService,
    private storageService: StorageService,
    private authUtilService: AuthUtilService,
    @Inject('config') private environment: Config
  ) {}

  initFlow(flowType: FlowType) {
    this.setToken(OAuth.ASK_TOKEN);
    switch (flowType) {
      case 'IMPLICIT_GRANT':
        //console.log('INIT IMPLICIT GRANT FLOW');
        this.initImplicitGrantFlow();
        break;
      case 'PKCE':
        //console.log('INIT PKCE FLOW');
        this.initPkceFlow();
        break;
      default:
        //console.log('Flow Type unknown');
        break;
    }
  }

  logOut() {
    this.storageService.removeAll();
    this._setToken$.next(false);
  }

  getToken(): string {
    return this.storageService.get(OAuth.ACCESS_TOKEN) || OAuth.TOKEN_UNSET;
  }

  getExpiresIn(): string {
    return this.storageService.get(OAuth.EXPIRES_IN) || null;
  }

  setExpiresIn(expire_in: number) {
    this.storageService.set(OAuth.EXPIRES_IN, expire_in);
  }

  getRefreshToken(): string | null {
    const refresh_token = this.storageService.get(OAuth.REFRESH_TOKEN);
    return refresh_token !== 'NO_REFRESH_TOKEN' ? refresh_token : null;
  }

  setRefreshToken(refresh_token: string) {
    this.storageService.set(
      OAuth.REFRESH_TOKEN,
      refresh_token ? refresh_token : 'NO_REFRESH_TOKEN'
    );
  }

  getIdToken(): string | null {
    const id_token = this.storageService.get(OAuth.ID_TOKEN);
    return id_token !== 'NO_ID_TOKEN' ? id_token : null;
  }

  setIdToken(id_token: string) {
    this.storageService.set(
      OAuth.ID_TOKEN,
      id_token ? id_token : 'NO_ID_TOKEN'
    );
  }

  setToken(token: string, expires_in?: number) {
    this.storageService.set(OAuth.ACCESS_TOKEN, token);
    if (token !== OAuth.ASK_TOKEN) {
      this._setToken$.next(true);
    } else {
      this._setToken$.next(false);
    }
    expires_in && this.setExpiresIn(expires_in);
  }

  setTokenFromFragmentURL(fragment: string) {
    const searchParams = new URLSearchParams(fragment);
    const token = searchParams.get(OAuth.ACCESS_TOKEN);
    this.setToken(token);
  }

  updateRefreshToken(): Observable<Token> {
    //console.log('updateRefreshToken()');
    const refresh_token = this.storageService.get(OAuth.REFRESH_TOKEN);
    return this.resourceService.getRefreshToken(refresh_token).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('An error occurred:', error.error);
        this.initFlow(this.environment.flowType);
        return throwError(error.message || 'server error.');
      })
    );
  }

  async getCodeAndAskToken(href, flowType: FlowType): Promise<any> {
    const code_array = href.match(REGEX_CODE);
    if (code_array) {
      const code = code_array[0].split(`code=`)[1];
      let token;
      if (flowType === 'PKCE') {
        token = this.getTokenPkce(code);
      }
      return token.then((token: Token) => {
        //if refresh_token, then store it
        token.refresh_token && this.setRefreshToken(token.refresh_token);
        //if openid, then store it
        token.id_token && this.setIdToken(token.id_token);
        //store token
        this.setToken(token.access_token, token.expires_in);
        return token;
      });
    }
  }

  async getTokenPkce(code_received): Promise<Token> {
    const token = await this.resourceService.getTokenPkce(
      this.environment.clientID,
      this.environment.redirectInfos.redirectURI,
      code_received,
      this.storageService.get(OAuth.CODE_VERIFIER)
    );
    return token;
  }

  getTokenImplicit() {
    this.resourceService.getTokenImplicit(
      this.environment.clientID,
      this.environment.redirectInfos.redirectURI,
      this.buildScopeParams(this.environment.flowType)
    );
  }

  is_token_valid(): Observable<boolean> {
    const token = this.getToken();
    return this.resourceService.getTokenValidity(token).pipe(
      map((_) => true),
      catchError((_) => of(false))
    );
  }

  private initImplicitGrantFlow() {
    this.getTokenImplicit();
  }

  private initPkceFlow() {
    this.codeVerifier = this.authUtilService.generateCodeVerifier();
    this.storageService.set(OAuth.CODE_VERIFIER, this.codeVerifier);
    this.codeChallenge = this.authUtilService.generateCodeChallenge(
      this.codeVerifier
    );
    this.sendCodeChallenge(this.codeChallenge);
  }

  private sendCodeChallenge(codeChallenge) {
    this.resourceService.sendCodeChallenge(
      this.environment.asURL,
      this.environment.clientID,
      this.environment.redirectInfos.redirectURI,
      codeChallenge,
      this.buildScopeParams(this.environment.flowType)
    );
  }

  private buildScopeParams(flowType: FlowType): string | null {
    let scopes = null;
    if (this.environment.scopes?.scopes.length > 0) {
      scopes = this.environment.scopes.scopes.reduce(
        (
          previous,
          current /* {
        if (flowType === 'PKCE') {
          return `${previous} ${current}`;
        } else { */
        ) => `${previous}+${current}`
        //}
        //}
      );
    }
    //console.log(scopes);
    return scopes;
  }
}
