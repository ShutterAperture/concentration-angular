import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ScoreboardComponent } from '../components/scoreboard/scoreboard.component';
import { AVAILABLE_PUZZLES, COMPARISON_INTERVAL, COOL_PRIZES, GAG_PRIZES, MESSAGE_DELAY, NUM_COLS, UTIL_PRIZES } from '../constants';
import { PlayerData, PuzzlePrize, RandomizedPuzzle, TrilonData } from '../interfaces';
import { TrilonState } from '../types';

const prizeSorter = (a: PuzzlePrize|RandomizedPuzzle, b: PuzzlePrize|RandomizedPuzzle) =>  a.rand - b.rand

@Component({
  selector: 'ca-concentration',
  templateUrl: './concentration.component.html',
  styleUrls: ['./concentration.component.scss'],
  animations: [
    // animation triggers go here

    trigger('insertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms 500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class ConcentrationComponent implements OnInit {
  initialized = false;
  singleMode!: boolean;
  players: string[] = []
  trilonArray: TrilonData[] = []
  initialState: TrilonState = 'number'
  puzzleArray: RandomizedPuzzle[] = [];
  puzzleIndex = 0;
  currentPuzzle!: RandomizedPuzzle;
  clickAllowed = false;
  prizeName: string = '';
  message: string | undefined;
  tilePair: TrilonData[] = [];
  unmatched: number[] = [];
  solutionFormVisible = false;
  explanation!: string;
  showExplanation = false;
  showGiveUp = false
  showPlayAgain = false;

  activePlayer: string = '';
  otherPlayer: string = '';

  activeIndex: 0|1 = 0;
  otherIndex: 0|1 = 1;

  @ViewChild(ScoreboardComponent) scoreboardComponent!: ScoreboardComponent;


  constructor() { }

  ngOnInit(): void {
    this.initializePuzzles();
    this.setPuzzle();
  }

  acceptPlayerData(playerData: PlayerData) {
    this.initialized = true;
    this.players = playerData.players;
    this.singleMode = playerData.singleMode
    this.initializePrizes();
    this.clickAllowed = true;
  }

  initializePuzzles() {
    this.puzzleArray = AVAILABLE_PUZZLES.map(puzzle => ({
      ...puzzle,
      rand: Math.random(),
      compareString: puzzle.solution.replace(/\W/gi,'').toLowerCase()
    })).sort(prizeSorter)
  }

  setPuzzle() {
    this.currentPuzzle = this.puzzleArray[this.puzzleIndex]
  }

  initializePrizes() {
    let coolPrizes: PuzzlePrize[] = this.generatePuzzlePrizes(COOL_PRIZES);
    let gagPrizes: PuzzlePrize[] = this.generatePuzzlePrizes(GAG_PRIZES);
    let utilPrizes: PuzzlePrize[]
    let goodPrizeCount = 8;
    if(this.singleMode)
    {
      utilPrizes = this.generatePuzzlePrizes(['Wild']); // Take and Forfeit are meaningless in single mode.
      goodPrizeCount = 12 // Compensate for absent transfer prizes
    }
    else
    {
      utilPrizes =  this.generatePuzzlePrizes(UTIL_PRIZES)
    }

    let rawPrizeArray = [...utilPrizes];
    rawPrizeArray = [...rawPrizeArray, ...coolPrizes.slice(0, goodPrizeCount)]; // pick off the first 10 or 12 cool prizes
    rawPrizeArray = [...rawPrizeArray, ...gagPrizes.slice(0, 2)]; // pick off the first 2 gag prizes

    // Create a match for each prize
    let intermediateArray: PuzzlePrize[] = []
    rawPrizeArray.forEach(rawPrize => {
      intermediateArray = [...intermediateArray, {...rawPrize, rand: Math.random()}, {...rawPrize, rand: Math.random()}]
    })

    intermediateArray.sort(prizeSorter) // Order them by the rand property; this shuffles the match

    this.setTrilonArray(intermediateArray)
  }

  setTrilonArray(prizeArray: PuzzlePrize[]) {
    this.trilonArray = prizeArray.map((prize, index) => {
      const visibleNumber = index +1;

      return {
        trilonState: this.initialState,
        visibleNumber,
        prizeName: prize.prizeName,
        row: Math.floor(index / NUM_COLS),
        col:  visibleNumber % NUM_COLS ? index % NUM_COLS : NUM_COLS - 1
      }
    });
    this.unmatched = this.trilonArray.map(trilonData => trilonData.visibleNumber)
  }

  generatePuzzlePrizes(prizeArray: string[]): PuzzlePrize[] {
    let puzzlePrizes =  prizeArray.map(prizeName => ({prizeName, rand: Math.random()}));
    return puzzlePrizes.sort(prizeSorter)
  }

  // Function to turn an individual number to the prize face
  turnToPrize(trilonData: TrilonData)
  {
    if(this.clickAllowed) {
      this.hideSolutionForm();
      const currentState = trilonData.trilonState
      if(currentState!= 'number' && currentState != this.initialState) {return;} // bail if not turned to the number face
      trilonData.trilonState = 'prize'
      this.prizeName = trilonData.prizeName
      // if(solutionVisible) {hideSolutionForm()}
      // TODO - Double Wild here?
      this.tilePair.push(trilonData)
      if (this.tilePair.length == 2) {this.testPrizes()}
    }

  }

  testPrizes() {
    this.scoreboardComponent.setTransferState(null)
    const match = this.tilePair.some(tile => tile.prizeName === 'Wild') || this.tilePair[0].prizeName === this.tilePair[1].prizeName;
    this.clickAllowed = false;
    setTimeout(() => this.actOnMatch(match), COMPARISON_INTERVAL);
    const matchMessage = match ? 'That\'s a match!!' : 'Sorry, that\'s not a match';
    this.setMessage(matchMessage)
  }

  actOnMatch(match: boolean) {
    // TODO - possibly deal with double wild here
    const newState = match ? 'puzzle' : 'number'
    this.tilePair.forEach(trilonData => trilonData.trilonState = newState);

    if(match)
    {
      let prizeWon = this.tilePair[0].prizeName;
      // Pull numbers off the unmatched Array
      const matchedNumbers = this.tilePair.map(trilonData => trilonData.visibleNumber)
      this.unmatched = this.unmatched.filter(num => !matchedNumbers.includes(num))

      if(prizeWon === 'Wild') {
        prizeWon = this.tilePair[1].prizeName;
      }

      this.scoreboardComponent.addPrize(prizeWon)

      this.showSolutionForm()
    }
    else
    {
      this.switchPlayers();
      this.clickAllowed = true; // allow more numbers to be chosen
      if(!this.singleMode)
      {
        this.setMessage(`${this.activePlayer}, your turn.`)
      }
      else {
        this.setMessage('Try Again')
      }
    }

    this.tilePair = [];
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
    this.clickAllowed = true;
    this.solutionFormVisible = true;
  }

  hideSolutionForm() {
    this.solutionFormVisible = false;
  }

  acceptSolution(solution: string|null) {
    this.hideSolutionForm()
    alert(solution)
    if(solution !== null) {
      solution = solution.replace(/\W/gi,'')
      solution = solution.toLowerCase() //strip out non-alphabetical characters, and set to lower case, for less strict checking.
      //alert(solutionString + '\n' + thisPuzzle.compareString)
      if (solution === this.currentPuzzle.compareString)
      {
        const clearBoth = false;
        this.revealBoard(clearBoth);
        this.setMessage('That\'s right! Congratulations!')
      }

      else
      {
        this.setMessage('Sorry, that\'s incorrect. It\'s still your turn.');
      }
      this.hideSolutionForm();
    }
  }

  revealBoard(clearBoth: boolean)
  {
    this.trilonArray.forEach(trilonData => trilonData.trilonState = 'puzzle')
    if(clearBoth)
    {
      this.scoreboardComponent.clearPrizes('clearBoth')
    }
    if (!this.singleMode)	//clear out opponent's prize rack
    {
      this.scoreboardComponent.clearPrizes('clear')
    }

    //show explanation
    this.explanation = `(${this.currentPuzzle.explanation})`
    this.showExplanation = true;
    this.showGiveUp = false
    this.showPlayAgain = true;
  }

  setMessage(message: string): void {
    this.message = message;
    setTimeout(() => this.message = undefined, MESSAGE_DELAY)
  };

}
