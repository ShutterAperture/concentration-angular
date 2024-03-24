import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DEFAULT_GAME_OPTIONS } from '../../constants';
import { LocalStorageService } from '../../services/local-storage.service';
import { MOCK_LOCAL_STORAGE_FACTORY, MockStorage } from '../../services/mockLocalStorageService-factory';

import { GameOptionComponent } from './game-option.component';

describe('GameOptionComponent', () => {
  let component: GameOptionComponent;
  let fixture: ComponentFixture<GameOptionComponent>;

  const mockStorage: MockStorage = {};
  const mockLocalStorageService = MOCK_LOCAL_STORAGE_FACTORY(mockStorage)

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameOptionComponent ],
      providers: [
        {provide: LocalStorageService, useValue: mockLocalStorageService}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(component.optionForm, 'patchValue');
    })
    it('should call subscribeToChanges', () => {
      spyOn(component, 'subscribeToChanges');
      component.ngOnInit()
      expect(component.subscribeToChanges).toHaveBeenCalled();
    })
    it('should use the saved options when there are some', () => {
      const expectedGameOptions = {
        enableSound: false,
        volume: 0,
        appearance: "default",
        blumenthalPuzzles: true
      }
      mockStorage.gameOptions = JSON.stringify(expectedGameOptions)
      component.ngOnInit();
      expect(component.optionForm.patchValue).toHaveBeenCalledWith(expectedGameOptions)
    })
    it('should use the default value when there is nothing saved', () => {
      mockStorage.gameOptions = undefined
      component.ngOnInit();
      expect(component.optionForm.patchValue).toHaveBeenCalledWith(DEFAULT_GAME_OPTIONS)
    })
  })

  describe('ngOnDestroy', () => {
    it('should next and complete the destroyed$ subject', () => {
      spyOn(component['destroyed$'], 'next');
      spyOn(component['destroyed$'], 'complete');

      component.ngOnDestroy();
      expect(component['destroyed$'].next).toHaveBeenCalled();
      expect(component['destroyed$'].complete).toHaveBeenCalled();
    })
  })
  describe('resetOptions', () => {
    it('should reset the options and close the menu', () => {
      spyOn(component.optionForm, 'patchValue');
      component.resetOptions();
      expect(component.gameOptions).toEqual(DEFAULT_GAME_OPTIONS);
      expect(component.optionForm.patchValue).toHaveBeenCalledWith(DEFAULT_GAME_OPTIONS);
      expect(component.showMenu).toBe(false);
    })
  })
  describe('subscribeToChanges', () => {
    it('should subscribe to form changes', () => {
      spyOn(component.optionForm.valueChanges, 'subscribe');
      component.subscribeToChanges();
      expect(component.optionForm.valueChanges.subscribe).toHaveBeenCalled();
    })
    it('should process form changes and emit them', fakeAsync(() => {
      spyOn(component.optionChanged, 'emit');
      component.subscribeToChanges();
      const change = {
        volume: .25,
        appearance: "nbc",
        blumenthalPuzzles: false
      }
      const expected = {
        enableSound: true,
        volume: .25,
        appearance: "nbc",
        blumenthalPuzzles: false
      }
      component.optionForm.patchValue(change);
      tick();

      expect(component.gameOptions).toEqual(expected);
      expect(mockLocalStorageService.setObject).toHaveBeenCalledWith('gameOptions', expected);
      expect(component.optionChanged.emit).toHaveBeenCalledWith(expected)
    }))
  })
  describe('toggleMenu', () => {
    it('should toggle the state of showMenu', () => {
      component.showMenu = false;
      const ev = new Event('click');
      spyOn(ev, 'stopPropagation');
      component.toggleMenu(ev, true);
      expect(ev.stopPropagation).toHaveBeenCalled();
      expect(component.showMenu).toBe(true);
    })
  })
});
