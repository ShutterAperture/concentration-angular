import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { MOCK_RANDOMIZED_PUZZLE_ARRAY } from '../../../mocks/randomized-puzzle-array-mock';
import { MOCK_TRILON_ARRAY } from '../../../mocks/trilon-array-mock';
import { ScoreboardComponent } from '../components/scoreboard/scoreboard.component';
import {
  AVAILABLE_PUZZLES, COMPARISON_INTERVAL, DEFAULT_GAME_OPTIONS, MESSAGE_DELAY, PLAY_AGAIN_DELAY, TRILON_SOUND_SOURCE
} from '../constants';
import { RandomizedPuzzle, TrilonData } from '../interfaces';
import { PuzzleService } from '../services/puzzle.service';
import { TrilonState } from '../types';

import { ConcentrationComponent, switchDirectionDelay } from './concentration.component';

const unmatchedBoard: number[] = [];
for (let i = 1; i <= 30; i++) {unmatchedBoard.push(i);}

const getFreshTrilonData = () => MOCK_TRILON_ARRAY.map(td => ({ ...td }));

const mockRandomizedPuzzle: RandomizedPuzzle = {
  ...AVAILABLE_PUZZLES[0],
  rand: 0.5,
  viewed: true,
  compareString: AVAILABLE_PUZZLES[0].solution.replace(/\W/gi, '').toLowerCase()
};

const mockPuzzleService = {
  getPuzzle: jasmine.createSpy('getPuzzle').and.returnValue(of(mockRandomizedPuzzle)),
  getTrilonData: jasmine.createSpy('getTrilonData'),
  appendViewedPuzzle: jasmine.createSpy('appendViewedPuzzle'),
  advanceToNextPuzzle: jasmine.createSpy('advanceToNextPuzzle')
};

describe('ConcentrationComponent', () => {
  let component: ConcentrationComponent;
  let fixture: ComponentFixture<ConcentrationComponent>;
  let puzzleService: PuzzleService;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [ NoopAnimationsModule ],
        providers: [
          {
            provide: PuzzleService,
            useValue: mockPuzzleService
          }
        ],
        declarations: [ ConcentrationComponent, ScoreboardComponent ],
        schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcentrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    puzzleService = TestBed.inject(PuzzleService);
    component.gameOptions.enableSound = false;

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set up the puzzles ', () => {
      spyOn(component, 'initTrilonSound');

      component.ngOnInit();
      expect(puzzleService.getPuzzle).toHaveBeenCalled();
      expect(component.initTrilonSound).toHaveBeenCalled();
    });
  });

  describe('acceptPlayerData', () => {
    beforeEach(() => {
      component.clickAllowed = false;
      component.initialized = false;
      spyOn(component, 'fetchTrilonArray');
    });
    it('should accept two-handed player data', () => {
      spyOn(component, 'switchPlayers');
      component.acceptPlayerData({
        singleMode: false,
        players: [ 'Fred', 'Barney' ]
      });
      expect(component.initialized).toBe(true);
      expect(component.singleMode).toBe(false);
      expect(component.fetchTrilonArray).toHaveBeenCalled();
      expect(component.players).toEqual([ 'Fred', 'Barney' ]);
      expect(component.switchPlayers).toHaveBeenCalled();
    });
    it('should accept singleMode player data', () => {
      component.acceptPlayerData({
        singleMode: true,
        players: []
      });
      expect(component.initialized).toBe(true);
      expect(component.singleMode).toBe(true);
      expect(component.fetchTrilonArray).toHaveBeenCalled();
      expect(component.players).toEqual([ 'Prizes' ]);
    });
  });

  describe('initTrilonSound', () => {
    it('should initialize the trilon sound', () => {
      const expected = new Audio(TRILON_SOUND_SOURCE);
      component.initTrilonSound();
      expect(component.trilonSound).toEqual(expected);
      expect(component.trilonSound.volume).toBe(.24);
    });
  });

  describe('playTrilon', () => {
    beforeEach(() => {
      component.gameOptions.enableSound = true;
      spyOn(component.trilonSound, 'play');
    });

    it('should play a sound if not stopped, or first time', () => {
      component.firstPlay = true;
      component.playTrilon();
      expect(component.firstPlay).toBe(false);
      expect(component.trilonSound.play).toHaveBeenCalled();
    });
  });

  describe('fetchTrilonArray', () => {
    it('should call the PuzzleService for the trilon array and call setTrilonArray', fakeAsync(() => {

      mockPuzzleService.getTrilonData.and.returnValue(of(MOCK_TRILON_ARRAY.map(td => ({ ...td }))));
      spyOn(component, 'setTrilonArray');
      component.singleMode = false;
      component.initialState = 'number';
      component.fetchTrilonArray();
      expect(puzzleService.getTrilonData).toHaveBeenCalledWith(component.singleMode, component.initialState);
    }));
  });

  describe('setTrilonArray', () => {
    let payload: TrilonData[];
    beforeEach(() => payload = getFreshTrilonData());

    it('should accept the passed trilon data array', () => {
      component.setTrilonArray(payload);
      expect(component.trilonArray).toBe(payload);
    });
    it('should set the unmatched array', () => {
      component.setTrilonArray(payload);
      expect(component.clickAllowed).toBe(true);
      expect(component.unmatched).toEqual(unmatchedBoard);
    });
  });

  describe('handleTrilonClick', () => {
    beforeEach(() => {
      component.scoreboardComponent = {
        getTransferState: jasmine.createSpy('getTransferState').and.returnValue(null),
        addPrize: jasmine.createSpy('addPrize')
      } as any;
      component.clickAllowed = true;
      spyOn(component, 'setMessage');
      spyOn(component, 'hideSolutionForm');
      spyOn(component, 'testForMatch');
      spyOn(component, 'playTrilon');
    });
    it('should update the trilon state if number, and add it to the tilePair', () => {
      const testTrilon = { ...MOCK_TRILON_ARRAY[1] };
      component.tilePair = [];
      component.doubleWildState = false;
      component.handleTrilonClick(testTrilon);
      expect(testTrilon.trilonState).toBe('prize');
      expect(component.tilePair).toEqual([ testTrilon ]);
      expect(component.playTrilon).toHaveBeenCalled();
    });
    it('should not update the trilon state if not number', () => {
      const testTrilon = { ...MOCK_TRILON_ARRAY[1] };
      testTrilon.trilonState = 'puzzle';
      component.tilePair = [];
      component.doubleWildState = false;
      component.handleTrilonClick(testTrilon);
      expect(testTrilon.trilonState).toBe('puzzle');
    });
    it('should test for a match on second number', () => {
      const testTrilon = { ...MOCK_TRILON_ARRAY[1] };
      const firstNumber = { ...MOCK_TRILON_ARRAY[10] };
      component.tilePair = [ firstNumber ];
      component.doubleWildState = false;
      component.handleTrilonClick(testTrilon);
      expect(component.tilePair).toEqual([ firstNumber, testTrilon ]);
      expect(component.testForMatch).toHaveBeenCalled();
    });
    it('should handle the double-wild state', () => {
      component.doubleWildState = true;
      const wild1 = { ...MOCK_TRILON_ARRAY[21] };
      const wild2 = { ...MOCK_TRILON_ARRAY[25] };
      const testTrilon = { ...MOCK_TRILON_ARRAY[1] };
      const firstNumber = { ...MOCK_TRILON_ARRAY[10] };
      component.tilePair = [ wild1, wild2, firstNumber ];
      component.handleTrilonClick(testTrilon);
      expect(component.scoreboardComponent.addPrize).toHaveBeenCalledWith(testTrilon.prizeName);
      expect(testTrilon.trilonState).toBe('prize');
      expect(component.doubleWildState).toBe(false);
      expect(component.tilePair).toEqual([]);
      expect(component.setMessage).toHaveBeenCalledWith(undefined);
    });
  });

  describe('testForMatch', () => {
    beforeEach(() => {
      spyOn(component, 'actOnMatch');
      spyOn(component, 'setMessage');
    });
    it('should detect matched prizes', () => {
      component.tilePair = [
        {
          visibleNumber: 2,
          trilonState: 'prize',
          prizeName: 'Trip',
          row: 0,
          col: 1
        }, {
          visibleNumber: 3,
          trilonState: 'prize',
          prizeName: 'Trip',
          row: 0,
          col: 2
        }
      ];

      component.testForMatch();
      expect(component.actOnMatch).toHaveBeenCalledWith(true);
    });
    it('should detect a wild card match', () => {
      component.tilePair = [
        {
          visibleNumber: 2,
          trilonState: 'prize',
          prizeName: 'Wild',
          row: 0,
          col: 1
        }, {
          visibleNumber: 3,
          trilonState: 'prize',
          prizeName: 'Trip',
          row: 0,
          col: 2
        }
      ];

      component.testForMatch();
      expect(component.actOnMatch).toHaveBeenCalledWith(true);
    });
    it('should handle a non-match', fakeAsync(() => {
      component.tilePair = [
        {
          visibleNumber: 2,
          trilonState: 'prize',
          prizeName: 'Wrong',
          row: 0,
          col: 1
        }, {
          visibleNumber: 3,
          trilonState: 'prize',
          prizeName: 'Trip',
          row: 0,
          col: 2
        }
      ];

      component.testForMatch();
      expect(component.actOnMatch).not.toHaveBeenCalled();
      tick(COMPARISON_INTERVAL);
      expect(component.actOnMatch).toHaveBeenCalledWith(false);
    }));
  });

  describe('actOnMatch', () => {
    beforeEach(() => {
      component.scoreboardComponent = {
        addPrize: jasmine.createSpy('addPrize')
      } as any;
      spyOn(component, 'setMessage');
      spyOn(component, 'playTrilon');
      component.trilonArray = getFreshTrilonData();
      component.unmatched = [ ...unmatchedBoard ];
    });
    it('should determine the prize name, add the prize, and show the solution form', fakeAsync(() => {
      spyOn(component, 'showSolutionForm');
      component.tilePair = [ component.trilonArray[0], component.trilonArray[3] ];
      component.actOnMatch(true);

      const expectedUnmatched = unmatchedBoard.filter(n => ![ 1, 4 ].includes(n));
      expect(component.unmatched).toEqual(expectedUnmatched);
      expect(component.scoreboardComponent.addPrize).toHaveBeenCalledWith('Snowblower');
      expect(component.showSolutionForm).toHaveBeenCalled();

      tick(COMPARISON_INTERVAL);
      expect(component.tilePair).toEqual([]);
      expect(component.trilonArray[0].trilonState).toBe('puzzle');
      expect(component.trilonArray[3].trilonState).toBe('puzzle');
      expect(component.playTrilon).toHaveBeenCalled();

    }));
    it('should determine the prize name if the first number was the wild card', () => {
      component.tilePair = [ { ...MOCK_TRILON_ARRAY[21] }, { ...MOCK_TRILON_ARRAY[3] } ];
      component.actOnMatch(true);
      expect(component.scoreboardComponent.addPrize).toHaveBeenCalledWith('Snowblower');
    });
    it('should recognize the double-wild state', () => {
      component.tilePair = [ { ...MOCK_TRILON_ARRAY[21] }, { ...MOCK_TRILON_ARRAY[25] } ];
      component.actOnMatch(true);
      expect(component.doubleWildState).toBe(true);
      expect(component.setMessage).toHaveBeenCalledWith('Congratulations! Pick two more prizes.');
    });
    it('should switch players and message (2 handed) when not a match', fakeAsync(() => {
      spyOn(component, 'switchPlayers').and.callThrough();
      component.players = [ 'Scott', 'Marty' ];
      component.activeIndex = 0;
      component.tilePair = [ component.trilonArray[0], component.trilonArray[29] ];
      component.singleMode = false;
      component.actOnMatch(false);
      expect(component.switchPlayers).toHaveBeenCalled();
      expect(component.setMessage).toHaveBeenCalledWith('Marty, your turn.', true);

      tick(COMPARISON_INTERVAL);
      expect(component.tilePair).toEqual([]);
      expect(component.trilonArray[0].trilonState).toBe('number');
      expect(component.trilonArray[3].trilonState).toBe('number');
      expect(component.playTrilon).toHaveBeenCalled();

    }));
    it('should switch players and message (single handed) when not a match', () => {
      component.tilePair = [ { ...MOCK_TRILON_ARRAY[0] }, { ...MOCK_TRILON_ARRAY[29] } ];
      component.singleMode = true;
      component.actOnMatch(false);
      expect(component.setMessage).toHaveBeenCalledWith('Try Again', true);
    });
  });

  describe('switchPlayers', () => {
    beforeEach(() => {
      component.singleMode = false;
      component.activeIndex = 0;
      component.otherIndex = 1;
      component.activePlayer = component.players[0];
      component.otherPlayer = component.players[1];
    });
    it('should switch the players', () => {
      component.switchPlayers();

      expect(component.activeIndex).toBe(1);
      expect(component.otherIndex).toBe(0);
      expect(component.activePlayer).toBe(component.players[1]);
      expect(component.otherPlayer).toBe(component.players[0]);

      component.switchPlayers();
      expect(component.activeIndex).toBe(0);
      expect(component.otherIndex).toBe(1);
    });
  });

  describe('showSolutionForm', () => {
    it('should show the solution form', () => {
      component.showSolutionForm();
      expect(component.solutionFormVisible).toBe(true);
    });
  });

  describe('hideSolutionForm', () => {
    beforeEach(() => {
      component.solutionFormVisible = true;
      spyOn(component, 'checkMatchable');
    });
    it('should hide the solution form, and call checkMatchable by default', () => {
      component.hideSolutionForm();
      expect(component.solutionFormVisible).toBe(false);
      expect(component.checkMatchable).toHaveBeenCalled();
    });
    it('should hide the solution form, and not call checkMatchable if passed doCheck=false', () => {
      component.hideSolutionForm(false);
      expect(component.solutionFormVisible).toBe(false);
      expect(component.checkMatchable).not.toHaveBeenCalled();
    });
  });

  describe('acceptSolution', () => {
    beforeEach(() => {
      component.currentPuzzle = MOCK_RANDOMIZED_PUZZLE_ARRAY[1];
      spyOn(component, 'hideSolutionForm');
      spyOn(component, 'setMessage');
      spyOn(component, 'revealBoard');
    });
    it('should hide the solution form if called with null', () => {
      component.acceptSolution(null);
      expect(component.hideSolutionForm).toHaveBeenCalled();
    });
    it('should recognize a match, and end the game', () => {
      component.acceptSolution('Space... the final frontier');
      expect(component.hideSolutionForm).toHaveBeenCalledWith(false);
      expect(component.revealBoard).toHaveBeenCalledWith(false);
      expect(component.setMessage).toHaveBeenCalledWith('That\'s right! Congratulations!');
    });
    it('should recognize a non-match', () => {
      component.acceptSolution('Space... the last frontier');
      expect(component.hideSolutionForm).toHaveBeenCalled();
      expect(component.revealBoard).not.toHaveBeenCalled();
      expect(component.setMessage).toHaveBeenCalledWith('Sorry, that\'s incorrect. It\'s still your turn.');
    });
  });

  describe('setBoardState', () => {
    const states: TrilonState[] = [ 'number', 'prize', 'puzzle' ];
    beforeEach(() => spyOn(component, 'playTrilon'));
    states.forEach((state: TrilonState) => {
      it(`should set every trilon to a trilon state of '${state}' when passed '${state}'`, () => {
        component.setBoardState(state);
        const expected = component.trilonArray.every(trilonData => trilonData.trilonState === state);
        expect(expected).toBe(true);
        expect(component.playTrilon).toHaveBeenCalled();
      });
    });

  });

  describe('revealBoard', () => {
    beforeEach(() => {
      component.scoreboardComponent = {
        clearPrizes: jasmine.createSpy('clearPrizes')
      } as any;
      spyOn(component, 'setBoardState');
      component.currentPuzzle = MOCK_RANDOMIZED_PUZZLE_ARRAY[1];
    });

    it('should set the board state to puzzle, and set flags', fakeAsync(() => {
      component.revealBoard(false);
      tick(switchDirectionDelay);
      expect(component.setBoardState).toHaveBeenCalledWith('puzzle');

      expect(component.explanation).toBe(`(${MOCK_RANDOMIZED_PUZZLE_ARRAY[1].explanation})`);
      expect(component.showExplanation).toBe(true);
      expect(component.showGiveUp).toBe(false);
      expect(component.showPlayAgain).toBe(true);
      expect(component.showEndGame).toBe(false);
    }));
    it('should record that the current puzzle has been viewed', fakeAsync(() => {
      component.revealBoard(false);
      tick(switchDirectionDelay);
      expect(mockPuzzleService.appendViewedPuzzle).toHaveBeenCalledWith(component.currentPuzzle.url);
    }));
    it('should call scoreboard clear prizes if passed true, in single mode', fakeAsync(() => {
      component.singleMode = true;
      component.revealBoard(true);
      tick(switchDirectionDelay);
      expect(component.scoreboardComponent.clearPrizes).toHaveBeenCalledWith(true);
    }));

    it('in non-single mode, it should clear the opponent\'s prizes', fakeAsync(() => {
      component.singleMode = false;
      component.revealBoard(true);
      tick(switchDirectionDelay);
      expect(component.scoreboardComponent.clearPrizes).toHaveBeenCalledWith(false);
    }));
  });

  describe('setMessage', () => {
    beforeEach(() => component.message = undefined);
    it('should set the message property', () => {
      component.setMessage('Test message');
      expect(component.message).toBe('Test message');
    });
    it('should set the message property, then clear it after a delay when passed clearAfterDelay=true', fakeAsync(() => {
      component.setMessage('Test message', true);
      expect(component.message).toBe('Test message');

      tick(MESSAGE_DELAY);
      expect(component.message).toBe(undefined);
    }));
  });

  describe('checkMatchable', () => {
    beforeEach(() => {
      component.trilonArray = [ ...MOCK_TRILON_ARRAY ];
      spyOn(component, 'noMoreMatches');
    });
    it('should call noMoreMatches if there are no more unmatched', () => {
      component.unmatched = [];
      component.checkMatchable();
      expect(component.noMoreMatches).toHaveBeenCalled();
    });
    it('should call noMoreMatches if there are only two unmatched prizes left', () => {
      component.unmatched = [ 2, 3 ];
      component.checkMatchable();
      expect(component.noMoreMatches).toHaveBeenCalled();
    });
    it('should not call noMoreMatches if there are only two matched prizes left', () => {
      component.unmatched = [ 1, 4 ];
      component.checkMatchable();
      expect(component.noMoreMatches).not.toHaveBeenCalled();
    });
    it('should not call noMoreMatches if there are more than two prizes left', () => {
      component.unmatched = [ ...unmatchedBoard ];
      component.checkMatchable();
      expect(component.noMoreMatches).not.toHaveBeenCalled();
    });
  });

  describe('noMoreMatches', () => {
    beforeEach(() => spyOn(component, 'playTrilon'));
    it('should turn off clicking and show the puzzle', () => {
      spyOn(component, 'setBoardState');

      component.noMoreMatches();
      expect(component.setBoardState).toHaveBeenCalledWith('puzzle');
      expect(component.clickAllowed).toBe(false);
      expect(component.finalGuess).toBe(true);
    });
    it('should show the solution and give up button in single mode', () => {
      component.singleMode = true;
      spyOn(component, 'setMessage');
      spyOn(component, 'showSolutionForm');

      component.noMoreMatches();
      expect(component.setMessage).toHaveBeenCalledWith(
        'There are no more matches. Enter the solution, or click the Give Up button to end the game.');
      expect(component.showSolutionForm).toHaveBeenCalled();
    });
    it('should show the end form in single handed mode', () => {
      component.singleMode = false;
      component.noMoreMatches();
      expect(component.showEndForm).toBe(true);
    });
  });

  describe('acceptFinalName', () => {
    it('should accept the final player index, set the indices correctly, do messaging and show the solution form', () => {
      spyOn(component, 'setMessage');
      spyOn(component, 'showSolutionForm');
      component.players = [ 'Jack', 'Jill' ];

      component.acceptFinalName(0);
      expect(component.activePlayer).toBe('Jack');
      expect(component.otherPlayer).toBe('Jill');
      expect(component.setMessage).toHaveBeenCalledWith(
        `Jack, enter your solution, or use the Cancel button to give Jill a chance to solve it.`);
      expect(component.showEndForm).toBe(false);
      expect(component.showSolutionForm).toHaveBeenCalled();
    });
  });

  describe('giveUp', () => {
    it('should show the puzzle and explanation', () => {
      component.currentPuzzle = MOCK_RANDOMIZED_PUZZLE_ARRAY[3];
      spyOn(component, 'setMessage');
      spyOn(component, 'revealBoard');
      spyOn(component, 'hideSolutionForm');

      component.giveUp();

      expect(component.setMessage).toHaveBeenCalledWith(`The puzzle says, 'Would you be my Valentine?'`);
      expect(component.revealBoard).toHaveBeenCalledWith(true);
      expect(component.hideSolutionForm).toHaveBeenCalledWith(false);
      expect(component.explanation).toBe('Wood + U + Bee + M + Eye + VAL + Hen + Tie + N');
      expect(component.showExplanation).toBe(true);
    });
  });

  describe('playAgain', () => {
    beforeEach(() => {
      spyOn(component, 'setMessage');
      spyOn(component, 'setBoardState');
      spyOn(component, 'setTrilonArray');
      mockPuzzleService.getPuzzle.and.returnValue(of({ ...MOCK_RANDOMIZED_PUZZLE_ARRAY[1] }));
      mockPuzzleService.getTrilonData.and.returnValue(of({ ...MOCK_TRILON_ARRAY }));
      component.scoreboardComponent = {
        clearPrizes: jasmine.createSpy('clearPrizes')
      } as any;
    });

    it('should set flags to start over', fakeAsync(() => {
      component.playAgain();
      tick(switchDirectionDelay);
      expect(component.showExplanation).toBe(false);
      expect(component.explanation).toBe(undefined);
      expect(component.clickAllowed).toBe(true);

      expect(component.setMessage).toHaveBeenCalledWith(undefined);
      expect(component.setBoardState).toHaveBeenCalledWith('number');
      expect(component.showPlayAgain).toBe(false);
      expect(component.showEndGame).toBe(true);
      expect(component.scoreboardComponent.clearPrizes).toHaveBeenCalledWith(true);
      tick(PLAY_AGAIN_DELAY);
      expect(component.currentPuzzle).toEqual(MOCK_RANDOMIZED_PUZZLE_ARRAY[1]);
      expect(component.setTrilonArray).toHaveBeenCalled();
    }));
  });

  describe('acceptGameOptions', () => {
    it('should accept the game options emitted by the game option component', () => {
      component.trilonSound = {
        src: TRILON_SOUND_SOURCE,
        volume: .24
      } as any as HTMLAudioElement;
      component.gameOptions = DEFAULT_GAME_OPTIONS;

      const newOptions = {
        enableSound: true,
        volume: .50,
        narzAppearance: true,
        blumenthalPuzzles: false
      };

      component.acceptGameOptions(newOptions);
      expect(component.gameOptions).toBe(newOptions);
      expect(component.trilonSound.volume).toBe(newOptions.volume);
    });
  });

});
