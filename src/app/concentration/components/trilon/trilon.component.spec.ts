import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrilonData } from '../../interfaces';

import { TrilonComponent } from './trilon.component';

let mediaMobileMatches = false;
let retinaMatches = false;
let mediaLargeDesktopMatches = false

const fakeMediaChecker = (media: string) => {
  let matches: boolean
  if(media === '(max-width: 600px)' ){
    matches =  mediaMobileMatches
  }
  else if(media === '(min-width: 1500px)' ){
    matches =  mediaLargeDesktopMatches
  }
  else if(media === '(min-width: 792px) and (min-resolution: 192dpi)' ){
    matches =  retinaMatches
  }
  else matches = false
  return {matches, media}
}
const mockWindow = {
  matchMedia: jasmine.createSpy('matchMedia').and.callFake(fakeMediaChecker)
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

    mediaMobileMatches = false;
    retinaMatches = false;
    mediaLargeDesktopMatches = false;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    const testCases = [
      {prize: 'Trip', expectedType: 'prize'},
      {prize: 'Take', expectedType: 'transfer'},
      {prize: 'Wild', expectedType: 'wild'}
    ];

    beforeEach(() => {
      component.puzzleUrl = 'pzzl-003.gif';
      component.puzzleUrlHiRes = 'pzzl-003-2x.gif';
      spyOn(component, 'generatePuzzleStyleObject').and.callThrough()
    })

    testCases.forEach(testCase => {
      it(`should set the prize type to '${testCase.expectedType}' when called with '${testCase.prize}' and call generatePuzzleStyleObject`, () => {

        let trilonData: TrilonData = {visibleNumber: 1, trilonState: 'number', row:0, col: 0, prizeName: testCase.prize};
        component.ngOnChanges({trilonData: new SimpleChange(null, trilonData, true)})

        expect(component.trilonData).toBe(trilonData);
        expect(component.prizeType).toBe(testCase.expectedType);
        expect(component.generatePuzzleStyleObject).toHaveBeenCalled()
      })
    })

  })

  describe('generatePuzzleStyleObject', () => {
    beforeEach(() => {
      component.puzzleUrl = 'pzzl-003.gif';
      component.puzzleUrlHiRes = 'pzzl-003-2x.gif';
      component.trilonData = {visibleNumber: 13, trilonState: 'number', row:2, col: 2, prizeName: 'Prize'};
    })
    it('should generate a style object for the trilon, when non-mobile, non-retina', () => {
      const expectedStyleObject = {
        backgroundImage : `url(/assets/puzzles/pzzl-003.gif)`,
        backgroundPosition: `-200px -130px`,
      }
      component.generatePuzzleStyleObject();
      expect(component.puzzleStyleObject).toEqual(expectedStyleObject)
    })
    it('should generate a style object for the trilon, when non-mobile, retina', () => {
      retinaMatches = true;

      const expectedStyleObject = {
        backgroundImage : `url(/assets/puzzles/pzzl-003-2x.gif)`,
        backgroundPosition: `-200px -130px`,
      }
      component.generatePuzzleStyleObject();
      expect(component.puzzleStyleObject).toEqual(expectedStyleObject)
    })
    it('should generate a style object for the trilon, when mobile', () => {
      mediaMobileMatches = true;

      const expectedStyleObject = {
        backgroundImage : `url(/assets/puzzles/pzzl-003.gif)`,
        backgroundPosition: `-122px -80px`,
      }
      component.generatePuzzleStyleObject();
      expect(component.puzzleStyleObject).toEqual(expectedStyleObject)
    })

    it('should generate a style object for the trilon, when large desktop', () => {
      mediaLargeDesktopMatches = true;

      const expectedStyleObject = {
        backgroundImage : `url(/assets/puzzles/pzzl-003.gif)`,
        backgroundPosition: `-302px -197px`,
      }
      component.generatePuzzleStyleObject();
      expect(component.puzzleStyleObject).toEqual(expectedStyleObject)
    })

    it("should recalculate the style object when resizeMarker is changed", () => {
      spyOn(component, 'generatePuzzleStyleObject').and.callThrough()
      let marker =  0.12345;
      component.ngOnChanges({resizeMarker: new SimpleChange(null, marker, true)});
      expect(component.generatePuzzleStyleObject).toHaveBeenCalled();
    })
  })
});
