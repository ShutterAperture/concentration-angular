import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrilonComponent } from './trilon.component';

describe('TrilonComponent', () => {
  let component: TrilonComponent;
  let fixture: ComponentFixture<TrilonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrilonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrilonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
