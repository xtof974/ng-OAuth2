import { Injectable } from '@angular/core';
import { OAuth } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _list = [
    OAuth.ACCESS_TOKEN,
    OAuth.REFRESH_TOKEN,
    OAuth.EXPIRES_IN,
    OAuth.ID_TOKEN,
    OAuth.CODE_VERIFIER,
  ];

  constructor() {}

  get(key: string) {
    return sessionStorage.getItem(key);
  }

  set(key: string, value: any) {
    sessionStorage.setItem(key, value);
  }

  remove(key: string) {
    sessionStorage.removeItem(key);
  }

  removeAll() {
    for (const key of this._list) {
      this.remove(key);
    }
  }
}
