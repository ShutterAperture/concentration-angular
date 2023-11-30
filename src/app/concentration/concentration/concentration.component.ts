import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, fromEvent, Subject, takeUntil } from 'rxjs';
import { delay, mergeMap, take, tap } from 'rxjs/operators';
import { ScoreboardComponent } from '../components/scoreboard/scoreboard.component';
import { COMPARISON_INTERVAL, DEFAULT_GAME_OPTIONS, MESSAGE_DELAY, PLAY_AGAIN_DELAY, TRILON_SOUND_SOURCE } from '../constants';
import { GameOptions, PlayerData, RandomizedPuzzle, TrilonData } from '../interfaces';
import { PuzzleService } from '../services/puzzle.service';
import { TrilonState } from '../types';

export const switchDirectionDelay = 200;

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
export class ConcentrationComponent implements OnInit, OnDestroy {
  players: string[] = [];
  trilonArray: TrilonData[] = [];
  initialState: TrilonState = 'number';
  currentPuzzle!: RandomizedPuzzle;
  destroyed$: Subject<void> = new Subject<void>();

  prizeName: string = '';

  tilePair: TrilonData[] = [];
  unmatched: number[] = []; // array of unmatched puzzle numbers

  trilonSound!: HTMLAudioElement;

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
  resizeMarker = 0;

  firstPlay = true;
  inhibitTransitions = false; // turn off rotation CSS transition
  exposeReady = false;

  gameOptions: GameOptions = DEFAULT_GAME_OPTIONS;

  @ViewChild(ScoreboardComponent) scoreboardComponent!: ScoreboardComponent;

  constructor(private puzzleService: PuzzleService) {
  }

  ngOnInit(): void {
    this.initTrilonSound();
    this.puzzleService.getPuzzle().pipe(take(1)).subscribe(puzzle => this.currentPuzzle = puzzle);

    fromEvent(window, 'resize')
      .pipe(
        takeUntil(this.destroyed$),
        debounceTime(200)
      ).subscribe(() => this.resizeMarker = Math.random());
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
    this.fetchTrilonArray();
  }

  initTrilonSound() {
    this.trilonSound = new Audio(TRILON_SOUND_SOURCE);
    this.trilonSound.volume = .24;
  }

  playTrilon() {
    if (this.gameOptions.enableSound) {
      if (this.firstPlay || this.trilonSound.ended) {
        this.trilonSound.play();
        this.firstPlay = false;
      }
      else {
        fromEvent(this.trilonSound, 'ended')
          .pipe(take(1))
          .subscribe(() => this.trilonSound.play());
      }
    }
  }

  fetchTrilonArray() {
    this.puzzleService.getTrilonData(this.singleMode, this.initialState)
      .pipe(take(1))
      .subscribe((trilonData: TrilonData[]) => this.setTrilonArray(trilonData));
  }

  setTrilonArray(trilonData: TrilonData[]) {
    this.trilonArray = trilonData;
    this.unmatched = this.trilonArray.map(trilonData => trilonData.visibleNumber);
    this.clickAllowed = true;
  }

  // Function to turn an individual number to the prize face
  handleTrilonClick(trilonData: TrilonData) {
    if (this.clickAllowed && this.scoreboardComponent.getTransferState() === null) {
      this.hideSolutionForm();
      const currentState = trilonData.trilonState;
      if (currentState != 'number' && currentState != this.initialState) {return;} // bail if not turned to the number face
      trilonData.trilonState = 'prize';
      this.playTrilon();
      this.prizeName = trilonData.prizeName;

      this.tilePair.push(trilonData);
      if (this.doubleWildState) {
        this.scoreboardComponent.addPrize(trilonData.prizeName);
        if (this.tilePair.length === 4) {
          this.doubleWildState = false;
          const tilePair = [ ...this.tilePair ];

          this.tilePair = [];
          this.setMessage(undefined);
          setTimeout(() => tilePair.forEach(td => {
            td.trilonState = 'puzzle';
            this.playTrilon();
          }), COMPARISON_INTERVAL);
        }
      }
      else {
        if (this.tilePair.length == 2) {this.testForMatch();}
      }
    }
  }

  testForMatch() {
    const match = this.tilePair.some(tile => tile.prizeName === 'Wild') || this.tilePair[0].prizeName === this.tilePair[1].prizeName;
    this.clickAllowed = false;

    if (match) {
      this.actOnMatch(match);
    }
    else {
      this.setMessage('Sorry, that\'s not a match.');
      setTimeout(() => this.actOnMatch(match), COMPARISON_INTERVAL);
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

      // If the player happens to pick both Wild Cards, they get to pick two more prizes
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
      const clearAfterDelay = true;
      if (!this.singleMode) {
        this.switchPlayers();
        this.setMessage(`${this.activePlayer}, your turn.`, clearAfterDelay);
      }
      else {
        this.setMessage('Try Again', clearAfterDelay);
      }
    }

    const cleanUpSelection = () => {
      this.clickAllowed = true; // allow more numbers to be chosen
      const newState = match ? 'puzzle' : 'number';
      this.tilePair.forEach(trilonData => trilonData.trilonState = newState);
      this.playTrilon();
      this.tilePair = [];
    };
    if (this.doubleWildState) {
      this.clickAllowed = true;
    }
    else {
      setTimeout(cleanUpSelection, COMPARISON_INTERVAL);
    }

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
    this.playTrilon();
  }

  switchTurnDirection(reverse: boolean): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    this.inhibitTransitions = true;
    this.exposeReady = reverse;
    return delay(switchDirectionDelay)
      .then(() => {
        this.inhibitTransitions = false
      });// wait, then allow transitions to be visible
  }

  async revealBoard(clearBoth: boolean) {
    await this.switchTurnDirection(true); // Updates number state degrees, so the rotation is reversed
    this.setBoardState('puzzle');
    this.puzzleService.appendViewedPuzzle(this.currentPuzzle.url);
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

  setMessage(message: string | undefined, clearAfterDelay: boolean = false): void {
    this.message = message;
    if (clearAfterDelay) { setTimeout(() => this.message = undefined, MESSAGE_DELAY);}
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

    this.finalGuess = true;

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
    this.setMessage(
      `${this.activePlayer}, enter your solution, or use the Cancel button to give ${this.otherPlayer} a chance to solve it.`);
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

  async playAgain() {
    //this.inhibitTransitions = false;
    this.clickAllowed = true;
    this.showExplanation = false;
    this.explanation = undefined;
    this.setMessage(undefined);
    this.setBoardState('number');

    this.showPlayAgain = false;

    this.showEndGame = true;
    const clearBoth = true;

    this.scoreboardComponent.clearPrizes(clearBoth);
    this.puzzleService.advanceToNextPuzzle();

    this.puzzleService.getPuzzle()
      .pipe(
        delay(PLAY_AGAIN_DELAY),
        tap((puzzle: RandomizedPuzzle) => this.currentPuzzle = puzzle),
        tap(() => this.switchTurnDirection(false)),
        mergeMap(() => this.puzzleService.getTrilonData(this.singleMode, this.initialState)))
      .subscribe(trilonData => this.setTrilonArray(trilonData))

    // await this.switchTurnDirection(false);
  }

  acceptGameOptions(gameOptions: GameOptions) {
    this.gameOptions = gameOptions;
    this.trilonSound.volume = this.gameOptions.volume;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
