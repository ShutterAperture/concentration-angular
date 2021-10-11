import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocalStorageService, {
          provide: Window,
          useValue: window
        }
      ]
    });
    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItem', () => {
    it('should call local storage getItem', () => {
      spyOn(Storage.prototype, 'getItem');
      service.getItem('myKey');
      expect(Storage.prototype.getItem).toHaveBeenCalledWith('myKey');
    });
  });

  describe('setItem', () => {
    it('should call localStorage setItem', () => {
      spyOn(Storage.prototype, 'setItem');
      service.setItem('myKey', 'keyValue');
      expect(Storage.prototype.setItem).toHaveBeenCalledWith('myKey', 'keyValue');
    });
  });

  describe('getObject', () => {
    it('should return the parsed value if one has been stored', () => {
      const obj = {
        key: 'value',
        foo: 'bar'
      };
      const fakeData = JSON.stringify(obj);
      spyOn(service, 'getItem').and.returnValue(fakeData);
      const result = service.getObject('objKey');
      expect(result).toEqual(obj);
    });
    it('should return null if there is no stored object', () => {
      spyOn(service, 'getItem').and.returnValue(null);
      const result = service.getObject('objKey');
      expect(result).toEqual(null);
    });
    it('should return null if the data is malformed', () => {
      spyOn(service, 'getItem').and.returnValue("{foo}");
      const result = service.getObject('objKey');
      expect(result).toEqual(null);
    });
  });

  describe('setObject', () => {
    it('should stringify an object and store it', () => {
      spyOn(service, 'setItem');
      const obj = {
        key: 'value',
        foo: 'bar'
      };
      const expected = JSON.stringify(obj);
      service.setObject('myKey', obj);
      expect(service.setItem).toHaveBeenCalledWith('myKey', expected);
    });
  });
});
