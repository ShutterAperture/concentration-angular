import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ScoreboardComponent } from '../components/scoreboard/scoreboard.component';
import { AVAILABLE_PUZZLES, COMPARISON_INTERVAL, COOL_PRIZES, GAG_PRIZES, NUM_COLS, UTIL_PRIZES } from '../constants';
import { PlayerData, PuzzlePrize, RandomizedPuzzle, TrilonData } from '../interfaces';
import { TrilonState } from '../types';

const prizeSorter = (a: PuzzlePrize | RandomizedPuzzle, b: PuzzlePrize | RandomizedPuzzle) => a.rand - b.rand;

@Component({
  selector: 'ca-concentration',
  templateUrl: './concentration.component.html',
  styleUrls: [ './concentration.component.scss' ],
  animations: [
    // animation triggers go here

    trigger('insertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }), animate('500ms 500ms', style({ opacity: 1 }))
      ]), transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ConcentrationComponent implements OnInit {

  players: string[] = [];
  trilonArray: TrilonData[] = [];
  initialState: TrilonState = 'number';
  puzzleArray: RandomizedPuzzle[] = [];
  puzzleIndex = 0;
  currentPuzzle!: RandomizedPuzzle;

  prizeName: string = '';

  tilePair: TrilonData[] = [];
  unmatched: number[] = []; // array of unmatched puzzle numbers

  // Player tracking
  activePlayer: string = '';
  otherPlayer: string = '';

  activeIndex: 0 | 1 = 0;
  otherIndex: 0 | 1 = 1;

  // UI strings
  message: string | undefined;
  explanation: string | undefined;

  // Flags
  initialized = false;
  singleMode!: boolean; // single handed mode
  clickAllowed = false; // user can pick numbers
  doubleWildState = false; // User has matched the two wild cards, and is picking prizes
  solutionFormVisible = false;
  showExplanation = false;
  showEndForm = false; // Form used at end of game to choose the player to solve puzzle
  showGiveUp = false;
  showPlayAgain = false;
  showEndGame = true;
  finalGuess = false; // this is the last guess.

  @ViewChild(ScoreboardComponent) scoreboardComponent!: ScoreboardComponent;

  constructor() {
  }

  ngOnInit(): void {
    this.initializePuzzles();
    this.setPuzzle();
  }

  acceptPlayerData(playerData: PlayerData) {
    this.initialized = true;
    this.players = playerData.players;
    this.singleMode = playerData.singleMode;
    if (this.singleMode) {
      this.players = [ 'Prizes' ];
      this.activeIndex = 0;
    }
    else {
      this.activeIndex = 1; // switchPlayers will set it back to 0
      this.switchPlayers();
    }
    this.initializePrizes();
    this.clickAllowed = true;
  }

  initializePuzzles() {
    this.puzzleArray = AVAILABLE_PUZZLES.map(puzzle => ({
      ...puzzle,
      rand: Math.random(),
      compareString: puzzle.solution.replace(/\W/gi, '').toLowerCase()
    })).sort(prizeSorter);
  }

  setPuzzle() {
    this.currentPuzzle = this.puzzleArray[this.puzzleIndex];
  }

  initializePrizes() {
    let coolPrizes: PuzzlePrize[] = this.generatePuzzlePrizes(COOL_PRIZES);
    let gagPrizes: PuzzlePrize[] = this.generatePuzzlePrizes(GAG_PRIZES);
    let utilPrizes: PuzzlePrize[];
    let goodPrizeCount = 8;
    if (this.singleMode) {
      utilPrizes = this.generatePuzzlePrizes([ 'Wild' ]); // Take and Forfeit are meaningless in single mode.
      goodPrizeCount = 12; // Compensate for absent transfer prizes
    }
    else {
      utilPrizes = this.generatePuzzlePrizes(UTIL_PRIZES);
    }

    let rawPrizeArray = [ ...utilPrizes ];
    rawPrizeArray = [ ...rawPrizeArray, ...coolPrizes.slice(0, goodPrizeCount) ]; // pick off the first 10 or 12 cool prizes
    rawPrizeArray = [ ...rawPrizeArray, ...gagPrizes.slice(0, 2) ]; // pick off the first 2 gag prizes

    // Create a match for each prize
    let intermediateArray: PuzzlePrize[] = [];
    rawPrizeArray.forEach(rawPrize => {
      intermediateArray = [
        ...intermediateArray, {
          ...rawPrize,
          rand: Math.random()
        }, {
          ...rawPrize,
          rand: Math.random()
        }
      ];
    });

    intermediateArray.sort(prizeSorter); // Order them by the rand property; this shuffles the match

    this.setTrilonArray(intermediateArray);
  }

  setTrilonArray(prizeArray: PuzzlePrize[]) {
    this.trilonArray = prizeArray.map((prize, index) => {
      const visibleNumber = index + 1;

      return {
        trilonState: this.initialState,
        visibleNumber,
        prizeName: prize.prizeName,
        row: Math.floor(index / NUM_COLS),
        col: visibleNumber % NUM_COLS ? index % NUM_COLS : NUM_COLS - 1
      };
    });
    this.unmatched = this.trilonArray.map(trilonData => trilonData.visibleNumber);
  }

  generatePuzzlePrizes(prizeArray: string[]): PuzzlePrize[] {
    let puzzlePrizes = prizeArray.map(prizeName => ({
      prizeName,
      rand: Math.random()
    }));
    return puzzlePrizes.sort(prizeSorter);
  }

  // Function to turn an individual number to the prize face
  turnToPrize(trilonData: TrilonData) {
    if (this.clickAllowed && this.scoreboardComponent.getTransferState() === null) {
      this.hideSolutionForm();
      const currentState = trilonData.trilonState;
      if (currentState != 'number' && currentState != this.initialState) {return;} // bail if not turned to the number face
      trilonData.trilonState = 'prize';
      this.prizeName = trilonData.prizeName;

      this.tilePair.push(trilonData);
      if (this.doubleWildState) {
        this.scoreboardComponent.addPrize(trilonData.prizeName);
        trilonData.trilonState = 'puzzle';
        if (this.tilePair.length === 2) {
          this.doubleWildState = false;
          this.tilePair = [];
          this.setMessage(undefined);
        }
      }
      else {
        if (this.tilePair.length == 2) {this.testPrizes();}
      }

    }

  }

  testPrizes() {
    const match = this.tilePair.some(tile => tile.prizeName === 'Wild') || this.tilePair[0].prizeName === this.tilePair[1].prizeName;
    this.clickAllowed = false;

    if (match) {
      this.actOnMatch(match);
    }
    else {
      setTimeout(() => this.actOnMatch(match), COMPARISON_INTERVAL);
    }

    if (!match) {
      this.setMessage('Sorry, that\'s not a match.');
    }
  }

  actOnMatch(match: boolean) {





    if (match) {
      let prizeWon = this.tilePair[0].prizeName;
      // Pull numbers off the unmatched Array
      const matchedNumbers = this.tilePair.map(trilonData => trilonData.visibleNumber);
      this.unmatched = this.unmatched.filter(num => !matchedNumbers.includes(num));

      if (prizeWon === 'Wild') {
        prizeWon = this.tilePair[1].prizeName;
      }

      if (this.tilePair[0].prizeName === 'Wild' && this.tilePair[1].prizeName === 'Wild') {
        this.doubleWildState = true;
        this.setMessage('Congratulations! Pick two more prizes.');
      }
      else {
        this.scoreboardComponent.addPrize(prizeWon);
      }

      this.showSolutionForm();
    }
    else {
      this.switchPlayers();

      if (!this.singleMode) {
        this.setMessage(`${this.activePlayer}, your turn.`, true);
      }
      else {
        const clearAfterDelay = true;
        this.setMessage('Try Again', clearAfterDelay);
      }
    }

    const cleanUpSelection = () => {
      this.clickAllowed = true; // allow more numbers to be chosen
      const newState = match ? 'puzzle' : 'number';
      this.tilePair.forEach(trilonData => trilonData.trilonState = newState);
      this.tilePair = [];
    }
    setTimeout(cleanUpSelection, COMPARISON_INTERVAL)

  }

  switchPlayers() {
    if (!this.singleMode) {
      this.activeIndex = this.activeIndex === 0 ? 1 : 0;
      this.otherIndex = this.activeIndex === 0 ? 1 : 0;
      this.activePlayer = this.players[this.activeIndex];
      this.otherPlayer = this.players[this.otherIndex];
    }
  }

  showSolutionForm() {
    this.solutionFormVisible = true;
  }

  hideSolutionForm(doCheck = true) {
    this.solutionFormVisible = false;
    if (doCheck) {
      this.checkMatchable();
    }
  }

  acceptSolution(solution: string | null) {
    if (solution !== null) {
      solution = solution.replace(/\W/gi, '');
      solution = solution.toLowerCase(); //strip out non-alphabetical characters, and set to lower case, for less strict checking.
      //alert(solutionString + '\n' + thisPuzzle.compareString)
      if (solution === this.currentPuzzle.compareString) {
        const clearBoth = false;
        const doCheck = false;
        this.hideSolutionForm(doCheck);
        this.revealBoard(clearBoth);
        this.setMessage('That\'s right! Congratulations!');
      }

      else {
        this.hideSolutionForm();
        this.setMessage('Sorry, that\'s incorrect. It\'s still your turn.');
      }

    }
    else {
      this.hideSolutionForm();
    }
  }

  setBoardState(trilonState: TrilonState) {
    this.trilonArray.forEach(trilonData => trilonData.trilonState = trilonState);
  }

  revealBoard(clearBoth: boolean) {
    this.setBoardState('puzzle');
    if (clearBoth) {
      this.scoreboardComponent.clearPrizes(clearBoth);
    }
    if (!this.singleMode)	//clear out opponent's prize rack
    {
      this.scoreboardComponent.clearPrizes(false);
    }

    //show explanation
    this.explanation = `(${this.currentPuzzle.explanation})`;
    this.showExplanation = true;
    this.showGiveUp = false;
    this.showPlayAgain = true;
    this.showEndGame = false;
  }

  setMessage(message: string|undefined, clearAfterDelay: boolean = false): void {
    this.message = message;
    // if (clearAfterDelay) { setTimeout(() => this.message = undefined, MESSAGE_DELAY);}
  };

  checkMatchable() {
    const getPrize = (visibleNumber: number) => this.trilonArray[visibleNumber - 1].prizeName;
    switch (this.unmatched.length) {
      case 0: {
        this.noMoreMatches();
        break;
      }
      case 2: {
        const firstUnmatchedNumber = this.unmatched[0];
        const secondUnmatchedNumber = this.unmatched[1];
        if (getPrize(firstUnmatchedNumber) !== getPrize(secondUnmatchedNumber)) {
          this.noMoreMatches();
        }
        break;
      }
      default:
        return;
    }
  }

  noMoreMatches() {
    this.clickAllowed = false; // stop the clicking
    this.setBoardState('puzzle');

    this.finalGuess = true; //

    if (this.singleMode) {
      this.setMessage('There are no more matches. Enter the solution, or click the Give Up button to end the game.');
      this.showGiveUp = true;
      this.showSolutionForm();
    }
    else {
      this.showEndForm = true;
    }
  }

  acceptFinalName(index: number) {
    this.activeIndex = index as 0 | 1;
    this.otherIndex = index === 0 ? 1 : 0;
    this.activePlayer = this.players[this.activeIndex];
    this.otherPlayer = this.players[this.otherIndex];
    this.setMessage(`${this.activePlayer}, enter your solution, or use the Cancel button to give ${this.otherPlayer} a chance to solve it'`);
    this.showEndForm = false;
    this.showSolutionForm();
  }

  giveUp() {
    this.setMessage(`The puzzle says, '${this.currentPuzzle.solution}'`);
    const clearBothScoreboards = true;
    this.revealBoard(clearBothScoreboards);
    this.explanation = this.currentPuzzle.explanation;
    this.showExplanation = true;
    const doMatchCheck = false;
    this.hideSolutionForm(doMatchCheck);
  }

  playAgain() {
    this.showExplanation = false;
    this.explanation = undefined;
    this.setMessage(undefined);
    this.setBoardState('number');
    this.showPlayAgain = false;

    this.showEndGame = true;
    const clearBoth = true;
    this.scoreboardComponent.clearPrizes(clearBoth);

    this.puzzleIndex++;
    if (this.puzzleIndex == this.puzzleArray.length) {this.puzzleIndex = 0;}

    const actualReset = () => {
      this.setPuzzle();
      this.initializePrizes();
    };
    setTimeout(actualReset, 1600); //run the reset code after allowing the visual reset

  }

}
