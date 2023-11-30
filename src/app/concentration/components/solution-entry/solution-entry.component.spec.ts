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
      const mockEvent = { preventDefault: () => undefined } as unknown as Event;
      spyOn(component.solutionProposed, 'emit')
      spyOn(mockEvent, 'preventDefault')
      component.solutionForm.get('solution')?.patchValue('This is the solution');
      component.checkSolution(mockEvent);
      expect(component.solutionProposed.emit).toHaveBeenCalledWith('This is the solution')
      expect(mockEvent.preventDefault).toHaveBeenCalled()
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
    it('should emit out giveUpGame when called', () => {
      spyOn(component.giveUpGame, 'emit')
      component.giveUp();
      expect(component.giveUpGame.emit).toHaveBeenCalled()
    })
  });
});
