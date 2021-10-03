import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MOCK_RANDOMIZED_PUZZLE_ARRAY } from '../../../mocks/randomized-puzzle-array-mock';
import { MOCK_TRILON_ARRAY } from '../../../mocks/trilon-array-mock';
import { ScoreboardComponent } from '../components/scoreboard/scoreboard.component';
import { AVAILABLE_PUZZLES, COMPARISON_INTERVAL, COOL_PRIZES, GAG_PRIZES, MESSAGE_DELAY, UTIL_PRIZES } from '../constants';
import { PuzzlePrize, RandomizedPuzzle, TrilonData } from '../interfaces';
import { TrilonState } from '../types';

import { ConcentrationComponent } from './concentration.component';

const unmatchedBoard: number[] = [];
for (let i = 1; i <= 30; i++) {unmatchedBoard.push(i);}

describe('ConcentrationComponent', () => {
  let component: ConcentrationComponent;
  let fixture: ComponentFixture<ConcentrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [ NoopAnimationsModule ],
        declarations: [ ConcentrationComponent, ScoreboardComponent ],
        schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcentrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set up the puzzles ', () => {
      spyOn(component, 'initializePuzzles').and.callThrough();
      spyOn(component, 'setPuzzle').and.callThrough();

      component.ngOnInit();
      expect(component.initializePuzzles).toHaveBeenCalled();
      expect(component.setPuzzle).toHaveBeenCalled();
    });
  });

  describe('acceptPlayerData', () => {
    beforeEach(() => {
      component.clickAllowed = false;
      component.initialized = false;
      spyOn(component, 'initializePrizes');
    });
    it('should accept two-handed player data', () => {
      spyOn(component, 'switchPlayers');
      component.acceptPlayerData({
        singleMode: false,
        players: [ 'Fred', 'Barney' ]
      });
      expect(component.clickAllowed).toBe(true);
      expect(component.initialized).toBe(true);
      expect(component.singleMode).toBe(false);
      expect(component.initializePrizes).toHaveBeenCalled();
      expect(component.players).toEqual([ 'Fred', 'Barney' ]);
      expect(component.switchPlayers).toHaveBeenCalled();
    });
    it('should accept singleMode player data', () => {
      component.acceptPlayerData({
        singleMode: true,
        players: []
      });
      expect(component.clickAllowed).toBe(true);
      expect(component.initialized).toBe(true);
      expect(component.singleMode).toBe(true);
      expect(component.initializePrizes).toHaveBeenCalled();
      expect(component.players).toEqual([ 'Prizes' ]);
    });
  });

  describe('initializePuzzles', () => {
    it('should add a random number and compare string to the available puzzles, and then sort them', () => {

      component.initializePuzzles();
      let randCheck = -1;
      const comparer = (mappedPuzzle: RandomizedPuzzle) => {
        const sourcePuzzle = AVAILABLE_PUZZLES.find(p => p.url === mappedPuzzle.url);
        let comparison = mappedPuzzle.urlRetina === sourcePuzzle?.urlRetina && mappedPuzzle.solution === sourcePuzzle?.solution && mappedPuzzle.explanation === sourcePuzzle?.explanation && mappedPuzzle.compareString === sourcePuzzle?.solution.replace(
          /\W/gi, '').toLowerCase() && !isNaN(mappedPuzzle.rand) && mappedPuzzle.rand > 0 && mappedPuzzle.rand < 1;

        // need to verify sorting
        comparison = comparison && mappedPuzzle.rand > randCheck;
        randCheck = mappedPuzzle.rand;
        return comparison;
      };
      expect(component.puzzleArray.every(comparer)).toBe(true);
    });
  });

  describe('setPuzzle', () => {
    it('should set the puzzle from the current index', () => {
      component.puzzleArray = MOCK_RANDOMIZED_PUZZLE_ARRAY;
      component.puzzleIndex = 2;
      component.setPuzzle();
      expect(component.currentPuzzle).toBe(MOCK_RANDOMIZED_PUZZLE_ARRAY[2]);
    });
  });

  describe('initializePrizes', () => {
    type TestCase = [string[], number]
    const checkPrizeType = (component: ConcentrationComponent, sourceArray: string[]) => {
      return component.trilonArray
        .filter((trilonData: TrilonData) => sourceArray.includes(trilonData.prizeName))
        .length
    }

    const runContentCategoryTests = (component: ConcentrationComponent, testCases: TestCase[]) => {
      testCases.forEach( ([sourceArray, expectedCount]: TestCase) => {
        const actualCount = checkPrizeType(component, sourceArray)
        expect(actualCount).toBe(expectedCount * 2); // each prize has a match
      })
    }
    beforeEach(() => {
      spyOn(component, 'generatePuzzlePrizes').and.callThrough();
      spyOn(component, 'setTrilonArray').and.callThrough();
    });
    it('should add a random number and a comparison string to the available prizes (2 handed)', () => {

      component.singleMode = false;
      component.initializePrizes();
      expect(component.generatePuzzlePrizes).toHaveBeenCalledWith(COOL_PRIZES)
      expect(component.generatePuzzlePrizes).toHaveBeenCalledWith(GAG_PRIZES);
      expect(component.generatePuzzlePrizes).toHaveBeenCalledWith(UTIL_PRIZES)
      expect(component.setTrilonArray).toHaveBeenCalled();


      const testCases: TestCase[] = [
        [COOL_PRIZES, 8],
        [GAG_PRIZES, 2],
        [UTIL_PRIZES, UTIL_PRIZES.length]
      ];
      runContentCategoryTests(component, testCases);

    });

    it('should add a random number and a comparison string to the available prizes (single handed)', () => {
      component.singleMode = true;
      component.initializePrizes();
      expect(component.generatePuzzlePrizes).toHaveBeenCalledWith(COOL_PRIZES)
      expect(component.generatePuzzlePrizes).toHaveBeenCalledWith(GAG_PRIZES);
      expect(component.generatePuzzlePrizes).toHaveBeenCalledWith(['Wild'])
      expect(component.setTrilonArray).toHaveBeenCalled();

      type TestCase = [string[], number]
      const testCases: TestCase[] = [
        [COOL_PRIZES, 12],
        [GAG_PRIZES, 2],
        [UTIL_PRIZES, 1]
      ];

      runContentCategoryTests(component, testCases);
    });
  });

  describe('setTrilonArray', () => {
    it('should map visible number, row and col to the puzzle array, and populate the unmatched array', () => {
      component.initialState = 'number';
      const mockPuzzleArray = [
        {
          prizeName: 'Prize 1',
          rand: 0.01
        }, {
          prizeName: 'Prize 2',
          rand: 0.02
        }, {
          prizeName: 'Prize 3',
          rand: 0.03
        }, {
          prizeName: 'Prize 4',
          rand: 0.04
        }, {
          prizeName: 'Prize 5',
          rand: 0.05
        }, {
          prizeName: 'Prize 1',
          rand: 0.06
        }, {
          prizeName: 'Prize 2',
          rand: 0.07
        }, {
          prizeName: 'Prize 3',
          rand: 0.08
        }, {
          prizeName: 'Prize 4',
          rand: 0.09
        }, {
          prizeName: 'Prize 5',
          rand: 0.1
        }
      ];
      const expected: TrilonData[] = [
        {
          trilonState: 'number',
          visibleNumber: 1,
          prizeName: 'Prize 1',
          row: 0,
          col: 0
        }, {
          trilonState: 'number',
          visibleNumber: 2,
          prizeName: 'Prize 2',
          row: 0,
          col: 1
        }, {
          trilonState: 'number',
          visibleNumber: 3,
          prizeName: 'Prize 3',
          row: 0,
          col: 2
        }, {
          trilonState: 'number',
          visibleNumber: 4,
          prizeName: 'Prize 4',
          row: 0,
          col: 3
        }, {
          trilonState: 'number',
          visibleNumber: 5,
          prizeName: 'Prize 5',
          row: 0,
          col: 4
        }, {
          trilonState: 'number',
          visibleNumber: 6,
          prizeName: 'Prize 1',
          row: 1,
          col: 0
        }, {
          trilonState: 'number',
          visibleNumber: 7,
          prizeName: 'Prize 2',
          row: 1,
          col: 1
        }, {
          trilonState: 'number',
          visibleNumber: 8,
          prizeName: 'Prize 3',
          row: 1,
          col: 2
        }, {
          trilonState: 'number',
          visibleNumber: 9,
          prizeName: 'Prize 4',
          row: 1,
          col: 3
        }, {
          trilonState: 'number',
          visibleNumber: 10,
          prizeName: 'Prize 5',
          row: 1,
          col: 4
        }
      ];

      component.setTrilonArray(mockPuzzleArray);
      expect(component.trilonArray).toEqual(expected);
      expect(component.unmatched).toEqual(unmatchedBoard.slice(0, 10));
    });
  });

  describe('generatePuzzlePrizes', () => {
    it('should map a string array into array with prizenames and random numbers, and sort them', () => {
      let randCheck = -1;

      let result: PuzzlePrize[] = component.generatePuzzlePrizes(COOL_PRIZES);

      const comparer = (puzzlePrize: PuzzlePrize) => {
        const sourcePrizeName = COOL_PRIZES.find(p => p === puzzlePrize.prizeName);

        // need to verify sorting
        const comparison = !!sourcePrizeName && puzzlePrize.rand > randCheck;
        randCheck = puzzlePrize.rand;
        return comparison;
      };
      expect(result.every(comparer)).toBe(true);
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
    });
    it('should update the trilon state if number, and add it to the tilePair', () => {
      const testTrilon = { ...MOCK_TRILON_ARRAY[1] };
      component.tilePair = [];
      component.doubleWildState = false;
      component.handleTrilonClick(testTrilon);
      expect(testTrilon.trilonState).toBe('prize');
      expect(component.tilePair).toEqual([ testTrilon ]);
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
      const wild1 = {...MOCK_TRILON_ARRAY[21]};
      const wild2 = {...MOCK_TRILON_ARRAY[25]}
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
      component.unmatched = [ ...unmatchedBoard ];
    });
    it('should determine the prize name, add the prize, and show the solution form', () => {
      spyOn(component, 'showSolutionForm');
      component.tilePair = [ { ...MOCK_TRILON_ARRAY[0] }, { ...MOCK_TRILON_ARRAY[3] } ];
      component.actOnMatch(true);

      const expectedUnmatched = unmatchedBoard.filter(n => ![ 1, 4 ].includes(n));
      expect(component.unmatched).toEqual(expectedUnmatched);
      expect(component.scoreboardComponent.addPrize).toHaveBeenCalledWith('Snowblower');
      expect(component.showSolutionForm).toHaveBeenCalled();

    });
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
    it('should switch players and message (2 handed) when not a match', () => {
      spyOn(component, 'switchPlayers').and.callThrough();
      component.players = [ 'Scott', 'Marty' ];
      component.activeIndex = 0;
      component.tilePair = [ { ...MOCK_TRILON_ARRAY[0] }, { ...MOCK_TRILON_ARRAY[29] } ];
      component.singleMode = false;
      component.actOnMatch(false);
      expect(component.switchPlayers).toHaveBeenCalled();
      expect(component.setMessage).toHaveBeenCalledWith('Marty, your turn.', true);

    });
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
    states.forEach((state: TrilonState) => {
      it(`should set every trilon to a trilon state of '${state}' when passed '${state}'`, () => {
        component.setBoardState(state);
        const expected = component.trilonArray.every(trilonData => trilonData.trilonState === state);
        expect(expected).toBe(true);
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
    it('should set the board state to puzzle, and set flags', () => {
      component.revealBoard(false);
      expect(component.setBoardState).toHaveBeenCalledWith('puzzle');

      expect(component.explanation).toBe(`(${MOCK_RANDOMIZED_PUZZLE_ARRAY[1].explanation})`);
      expect(component.showExplanation).toBe(true);
      expect(component.showGiveUp).toBe(false);
      expect(component.showPlayAgain).toBe(true);
      expect(component.showEndGame).toBe(false);
    });
    it('should call scoreboard clear prizes if passed true, in single mode', () => {
      component.singleMode = true;
      component.revealBoard(true);
      expect(component.scoreboardComponent.clearPrizes).toHaveBeenCalledWith(true);
    });

    it('in non-single mode, it should clear the opponent\'s prizes', () => {
      component.singleMode = false;
      component.revealBoard(true);
      expect(component.scoreboardComponent.clearPrizes).toHaveBeenCalledWith(false);
    });
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
      component.scoreboardComponent = {
        clearPrizes: jasmine.createSpy('clearPrizes')
      } as any;
    });

    it('should set flags to start over', () => {
      component.puzzleIndex = 1;
      component.playAgain();

      expect(component.showExplanation).toBe(false);
      expect(component.explanation).toBe(undefined);
      expect(component.clickAllowed).toBe(true);

      expect(component.setMessage).toHaveBeenCalledWith(undefined);
      expect(component.setBoardState).toHaveBeenCalledWith('number');
      expect(component.showPlayAgain).toBe(false);
      expect(component.showEndGame).toBe(true);
      expect(component.scoreboardComponent.clearPrizes).toHaveBeenCalledWith(true);
      expect(component.puzzleIndex).toBe(2);
    });
    it('should start over if all puzzles have been played', () => {
      component.puzzleIndex = component.puzzleArray.length - 1;
      component.playAgain();
      expect(component.puzzleIndex).toBe(0);
    });
    it('should set the puzzle and reinitialize after a delay', fakeAsync(() => {
      spyOn(component, 'setPuzzle');
      spyOn(component, 'initializePrizes');
      component.playAgain();
      tick(1600);

      expect(component.setPuzzle).toHaveBeenCalled();
      expect(component.initializePrizes).toHaveBeenCalled();
    }));
  });

});
