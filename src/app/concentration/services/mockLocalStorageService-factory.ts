export interface MockStorage {[keyname: string]: string|undefined}

export const MOCK_LOCAL_STORAGE_FACTORY = (mockStorage: MockStorage) => (
 {
  getItem: jasmine.createSpy('getItem').and.callFake((keyName: string) => mockStorage[keyName] ?? null),
  setItem: jasmine.createSpy('setItem').and.callFake((keyName: string, data:string) => mockStorage[keyName] = data),
  getObject: jasmine.createSpy('getObject').and.callFake((keyName: string) => {
    const data = mockStorage[keyName];
    if(!!data) { return JSON.parse(data)}
    else {return null}
  }),
  setObject: jasmine.createSpy('setObject').and.callFake((keyName: string, data:any) => mockStorage[keyName] = JSON.stringify(data))
}
)
