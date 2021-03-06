import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AVAILABLE_PUZZLES, COOL_PRIZES, GAG_PRIZES, NUM_COLS, UTIL_PRIZES, VIEWED_PUZZLES_KEY } from '../constants';
import { PuzzlePrize, RandomizedPuzzle, TrilonData } from '../interfaces';
import { TrilonState } from '../types';
import { LocalStorageService } from './local-storage.service';

const prizeSorter = (a: PuzzlePrize, b: PuzzlePrize) => a.rand - b.rand;
const puzzleSorter = (a: RandomizedPuzzle, b: RandomizedPuzzle) => {
  if (a.viewed !== b.viewed) {
    return a.viewed ? 1 : -1;
  }
  return a.rand - b.rand;
};

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  puzzleArray: RandomizedPuzzle[] = [];
  puzzleIndex = 0;

  viewedPuzzleUrls: string[] = [];

  constructor(private localStorageService: LocalStorageService) {
    this.initializePuzzles();
  }

  initializePuzzles() {
    this.getViewedPuzzles();
    this.puzzleArray = AVAILABLE_PUZZLES.map(puzzle => ({
      ...puzzle,
      rand: Math.random(),
      compareString: puzzle.solution.replace(/\W/gi, '').toLowerCase(),
      viewed: this.viewedPuzzleUrls.includes(puzzle.url)
    })).sort(puzzleSorter);
  }

  getPuzzle(): Observable<RandomizedPuzzle> {
    return of(this.puzzleArray[this.puzzleIndex]);
  }

  getViewedPuzzles() {
    this.viewedPuzzleUrls = this.localStorageService.getObject<string[]>(VIEWED_PUZZLES_KEY) ?? [];
  }

  advanceToNextPuzzle() {
    this.puzzleIndex++;
    if (this.puzzleIndex == this.puzzleArray.length) {this.puzzleIndex = 0;}
  }

  getTrilonData(isSingle: Boolean, initialState: TrilonState = 'number'): Observable<TrilonData[]> {
    const prizeSet = this.createPrizeSet(isSingle);
    const prizesWithMatches = this.createMatchForEachPrize(prizeSet);
    return of(this.mapToTrilonData(prizesWithMatches, initialState));
  }

  generatePuzzlePrizes(prizeArray: string[]): PuzzlePrize[] {
    let puzzlePrizes = prizeArray.map(prizeName => ({
      prizeName,
      rand: Math.random()
    }));
    return puzzlePrizes.sort(prizeSorter);
  }

  createPrizeSet(isSingle: Boolean): PuzzlePrize[] {
    let coolPrizes: PuzzlePrize[] = this.generatePuzzlePrizes(COOL_PRIZES);
    let gagPrizes: PuzzlePrize[] = this.generatePuzzlePrizes(GAG_PRIZES);
    let utilPrizes: PuzzlePrize[];
    let goodPrizeCount = 7;
    let gagPrizeCount = 3;
    if (isSingle) {
      utilPrizes = this.generatePuzzlePrizes([ 'Wild' ]); // Take and Forfeit are meaningless in single mode.
      goodPrizeCount = 12; // Compensate for absent transfer prizes
      gagPrizeCount = 2;
    }
    else {
      utilPrizes = this.generatePuzzlePrizes(UTIL_PRIZES);
    }

    let prizeSet = [ ...utilPrizes ];
    prizeSet = [ ...prizeSet, ...coolPrizes.slice(0, goodPrizeCount) ]; // pick off the first 10 or 12 cool prizes
    prizeSet = [ ...prizeSet, ...gagPrizes.slice(0, gagPrizeCount) ]; // pick off the first 2 gag prizes
    return prizeSet;
  }

  createMatchForEachPrize(prizeSet: PuzzlePrize[]): PuzzlePrize[] {
    let intermediateArray: PuzzlePrize[] = [];
    prizeSet.forEach(rawPrize => {
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

    return intermediateArray.sort(prizeSorter); // Order them by the rand property; this shuffles the match
  }

  mapToTrilonData(prizeArray: PuzzlePrize[], initialState: TrilonState = 'number'): TrilonData[] {
    return prizeArray.map((prize, index) => {
      const visibleNumber = index + 1;

      return {
        trilonState: initialState,
        visibleNumber,
        prizeName: prize.prizeName,
        row: Math.floor(index / NUM_COLS),
        col: visibleNumber % NUM_COLS ? index % NUM_COLS : NUM_COLS - 1
      };
    });
  }

  appendViewedPuzzle(puzzleUrl: string) {
    if (!this.viewedPuzzleUrls.includes(puzzleUrl)) {
      this.viewedPuzzleUrls = [ ...this.viewedPuzzleUrls, puzzleUrl ];
      this.localStorageService.setObject(VIEWED_PUZZLES_KEY, this.viewedPuzzleUrls);
    }
  }
}


