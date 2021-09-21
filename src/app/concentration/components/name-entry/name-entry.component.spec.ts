import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NameEntryComponent } from './name-entry.component';

const spyOnEmission = (component: NameEntryComponent) => spyOn(component.playerData, 'emit');
const spyOnClearForm = (component: NameEntryComponent) => spyOn(component, 'clearForm');
const controlNames = ['player1', 'player2'];

describe('NameEntryComponent', () => {
  let component: NameEntryComponent;
  let fixture: ComponentFixture<NameEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameEntryComponent ],
      imports: [ReactiveFormsModule],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => component.entryForm = new FormGroup({}));
    it('should generate the entry form', () => {
      component.ngOnInit();
      controlNames.forEach((ctrlName) => {
        const control = component.entryForm.get(ctrlName);
        expect(control instanceof FormControl).toBe(true);
        // @ts-ignore - not null
        expect(control.errors).toEqual({required: true});
        // @ts-ignore - not null
        expect(control.value).toBe('')
      })
    })
  });

  describe('setSingle', () => {
    beforeEach(() => {
      spyOnEmission(component);
      spyOnClearForm(component)
    })
    it('should emit out single mode true and empty players', () => {
       component.setSingle();
       expect(component.playerData.emit).toHaveBeenCalledWith({
         singleMode: true,
         players: []
       })
      expect(component.clearForm).toHaveBeenCalled();
    })
  });

  describe('setTwoHanded', () => {
    beforeEach(() => {
      component.entryForm.get('player1')?.patchValue('Adam');
      component.entryForm.get('player2')?.patchValue('Burt')
      spyOnEmission(component);
      spyOnClearForm(component);
    })
    it('should emit out non-single mode, and the names of the players', () => {
       component.setTwoHanded();
      expect(component.playerData.emit).toHaveBeenCalledWith({
        singleMode: false,
        players: ['Adam', 'Burt']
      })
      expect(component.clearForm).toHaveBeenCalled();
    })
  });

  describe('clearForm', () => {
    beforeEach(() => {
      component.entryForm.get('player1')?.patchValue('Adam');
      component.entryForm.get('player2')?.patchValue('Burt')
    })
    it('should clear the entry form', () => {
      component.clearForm();

      // @ts-ignore
      controlNames.forEach((ctrlName) => expect(component.entryForm.get(ctrlName).value).toBe(''))
    })
  });
});
