import { Inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config, Token } from '../models/auth.model';
import { AuthUtilService } from './auth.util.service';

@Injectable({
  providedIn: 'root',
})
export class ResourcesService {
  constructor(
    private httpWeb: HttpClient,
    private authUtilService: AuthUtilService,
    @Inject('config') private environment: Config
  ) {}

  getTokenValidity(token: string): Observable<any> {
    const url = `${this.environment.asURL}/tokeninfo`;
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    let body = `access_token=${token}`;
    body = `client_id=${this.environment.clientID}&access_token=${token}`;
  
    return this.httpWeb.post(url, encodeURI(body), { headers });
  }

  getTokenImplicit(
    clientID: string,
    redirectURI: string,
    scopes: string | null
  ) {
    let authUrl = `${this.environment.asURL}/authorize?client_id=${clientID}&response_type=token&redirect_uri=${redirectURI}`;
    if (scopes) {
      authUrl = authUrl + `&scope=${scopes}`;
    }
    window.location.href = authUrl;
  }

  sendCodeChallenge(
    asURL: string,
    clientID: string,
    redirectURI: string,
    codeChallenge: string,
    scopes: string | null
  ) {
    let authUrl = `${asURL}/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectURI}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    if (scopes) {
      authUrl = authUrl + `&scope=${scopes}`;
    }
    window.location.href = authUrl;
  }

  public getRefreshToken(refresh_token: string): Observable<Token> {
    //console.log('resource getRefreshToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = `client_id=${this.environment.clientID}&grant_type=refresh_token&refresh_token=${refresh_token}`;

    return this.httpWeb.post<Token>(
      `${this.environment.asURL}/token`,
      encodeURI(body),
      {
        headers,
      }
    );
  }

  public getTokenPkce(
    clientID: string,
    redirectURI: string,
    code: string,
    codeVerifier: string
  ): Promise<Token> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = `client_id=${clientID}&code=${code}&redirect_uri=${redirectURI}&grant_type=authorization_code&code_verifier=${codeVerifier}`;
    return this.httpWeb
      .post<Token>(`${this.environment.asURL}/token`, encodeURI(body), {
        headers,
      })
      .toPromise();
  }
}
