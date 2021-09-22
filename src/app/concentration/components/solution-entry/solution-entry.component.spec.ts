import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { SolutionEntryComponent } from './solution-entry.component';

describe('SolutionEntryComponent', () => {
  let component: SolutionEntryComponent;
  let fixture: ComponentFixture<SolutionEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
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

  describe('checkSolution', () => {
    it('should emit out the entered solution via solutionProposed', () => {
      spyOn(component.solutionProposed, 'emit')
      component.solutionForm.get('solution')?.patchValue('This is the solution');
      component.checkSolution();
      expect(component.solutionProposed.emit).toHaveBeenCalledWith('This is the solution')
    })
  });

  describe('cancelSolve', () => {
    it('should emit out null via solutionProposed', () => {
      spyOn(component.solutionProposed, 'emit')
      component.cancelSolve();
      expect(component.solutionProposed.emit).toHaveBeenCalledWith(null)
    })
  });

  describe('giveUp', () => {
    it('should emit out ____________', () => {
      spyOn(component.giveUpGame, 'emit')
      component.giveUp();
      expect(component.giveUpGame.emit).toHaveBeenCalled()
    })
  });
});
