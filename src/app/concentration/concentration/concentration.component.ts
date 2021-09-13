import { Component, OnInit } from '@angular/core';
import { COOL_PRIZES, GAG_PRIZES, NUM_COLS, NUM_ROWS, UTIL_PRIZES } from '../constants';
import { PlayerData, PuzzlePrize, TrilonData } from '../interfaces';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { TrilonState } from '../types';

const prizeSorter = (a: PuzzlePrize, b: PuzzlePrize) =>  a.rand - b.rand

@Component({
  selector: 'ca-concentration',
  templateUrl: './concentration.component.html',
  styleUrls: ['./concentration.component.scss'],
  animations: [
    // animation triggers go here
    trigger('toggleVisibility', [
      state('visible', style({
        opacity: 1,
        display: 'block'
      })),
      state('hidden', style({
        opacity: 0,
        display: 'none'
      })),
      transition('visible => hidden', [
        animate('0.75s ease-in-out')
      ])
    ])
  ]
})
export class ConcentrationComponent implements OnInit {
  initialized = false;
  singleMode!: boolean;
  players: string[] = []
  trilonArray: TrilonData[] = []
  initialState: TrilonState = 'number'

  constructor() { }

  ngOnInit(): void {
  }



  acceptPlayerData(playerData: PlayerData) {
    this.initialized = true;
    this.players = playerData.players;
    this.singleMode = playerData.singleMode
    this.initializePrizes();
    console.dir(this)
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

    console.table(rawPrizeArray)
    // Create a match for each prize
    let intermediateArray: PuzzlePrize[] = []
    rawPrizeArray.forEach(rawPrize => {
      intermediateArray = [...intermediateArray, {...rawPrize, rand: Math.random()}, {...rawPrize, rand: Math.random()}]
    })

    intermediateArray.sort(prizeSorter) // Order them by the rand property; this shuffles the match
    console.table(intermediateArray)

    this.setTrilonArray(intermediateArray)
  }

  setTrilonArray(prizeArray: PuzzlePrize[]) {
    this.trilonArray = prizeArray.map((prize, index) => {
      const visibleNumber = index +1;

      return {
        trilonState: this.initialState,
        visibleNumber,
        prizeName: prize.prizeName,
        url: 'background.jpg',
        urlRetina: 'background.jpg',
        row: 1 + Math.floor(index / NUM_COLS),
        col:  visibleNumber % NUM_COLS ? visibleNumber % NUM_COLS : NUM_COLS
      }
    });

    console.table(this.trilonArray)
  }

  generatePuzzlePrizes(prizeArray: string[]): PuzzlePrize[] {
    let puzzlePrizes =  prizeArray.map(prizeName => ({prizeName, rand: Math.random()}));
    return puzzlePrizes.sort(prizeSorter)
  }

}
