export enum OAuth {
  TOKEN = 'token',
  ASK_TOKEN = 'ask-token',
  TOKEN_UNSET = 'token-unset',
  ACCESS_TOKEN = 'access_token',
  AUTHORIZATION = 'Authorization',
  BEARER = 'Bearer',
  INVALID_TOKEN = 'invalid_token',
  EXPIRES_IN = 'expires_in',
  CODE = 'code',
  REFRESH_TOKEN = 'refresh_token',
  CODE_VERIFIER = 'CodeVerifier',
  ID_TOKEN = 'id_token',
}

export interface Config {
  asURL: string;
  rsURL: string;
  clientID: string;
  redirectInfos: RedirectInfos;
  flowType: FlowType;
  extras: Extras;
  scopes?: Scopes;
}

export interface RedirectInfos {
  redirectURI: string;
  home: string;
}

export interface Token {
  access_token: string | null;
  expires_in: number | null;
  refresh_token?: string | null;
  id_token?: string | null;
}

export interface Extras {
  saveNavigation: boolean;
  delayBeforeRefreshToken: number;
}

export interface Scopes {
  scopes: string[];
}

export type FlowType = 'IMPLICIT_GRANT' | 'PKCE';

export const REGEX_ACCESS_TOKEN = /(access_token=)[a-zA-Z0-9]+/g;
export const REGEX_REFRESH_TOKEN = /(refresh_token=)[a-zA-Z0-9]+/g;
export const REGEX_EXPIRES_IN = /(expires_in=)[0-9]+/g;
export const REGEX_CODE = /(code=)[a-zA-Z0-9]+/g;
