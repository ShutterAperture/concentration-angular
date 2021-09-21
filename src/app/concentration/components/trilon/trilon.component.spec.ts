import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrilonComponent } from './trilon.component';

const mockWindow = {
  matchMedia: jasmine.createSpy('matchMedia').and.returnValue({matches: false})
}
describe('TrilonComponent', () => {
  let component: TrilonComponent;
  let fixture: ComponentFixture<TrilonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrilonComponent ],
      providers: [{provide: Window, useValue: mockWindow}]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrilonComponent);
    component = fixture.componentInstance;
    component.trilonData = {trilonState: 'number', visibleNumber: 1, prizeName: 'Test', col: 0, row: 0};
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
