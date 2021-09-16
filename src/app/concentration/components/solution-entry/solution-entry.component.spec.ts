import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionEntryComponent } from './solution-entry.component';

describe('SolutionEntryComponent', () => {
  let component: SolutionEntryComponent;
  let fixture: ComponentFixture<SolutionEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolutionEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
