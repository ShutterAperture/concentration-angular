import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  localStorage: Storage = this.window.localStorage;
  constructor(private window: Window) { }

  getItem(keyName: string) {
     return this.localStorage.getItem(keyName)
  }

  getObject<T>(keyName: string): T|null {
    const storedString = this.getItem(keyName);
    if(storedString) {
      try {
        return JSON.parse(storedString) as T
      }
      catch(e) {
         return null
      }
    } else {
      return null
    }
  }

  setItem(keyName: string, data: string): void {
    this.localStorage.setItem(keyName, data)
  }

  setObject<T>(keyName: string, data: T): void {
     const storageString = JSON.stringify(data);
     this.setItem(keyName, storageString)
  }
}


