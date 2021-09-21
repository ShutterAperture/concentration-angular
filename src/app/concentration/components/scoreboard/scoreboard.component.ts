import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PlayerPrizes, Prize } from '../../interfaces';

@Component({
  selector: 'ca-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit, OnChanges {
  @Input() players: string[] = [];
  @Input() singleMode =  false;
  @Input() activeIndex: 0|1 = 0; // holds index of current player
  @Input() otherIndex: 0|1 = 1;  // holds index of other player
  @Output() sentMessage: EventEmitter<string> = new EventEmitter<string>();
  @Output() transferring: EventEmitter<boolean>  = new EventEmitter<boolean>()
  playerPrizes: PlayerPrizes[] = []
  activePlayerPrizes!: PlayerPrizes;
  otherPlayerPrizes!: PlayerPrizes;



  transferState: null |'Take' |'Forfeit' = null;
  constructor() { }

  ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges) {
    if(changes?.players?.currentValue) {
      this.players = changes.players.currentValue;
      this.playerPrizes = this.players.map(player => ({player, prizes: []}))
    }

    if(changes?.activeIndex?.currentValue !== undefined) {
      this.activeIndex = changes.activeIndex.currentValue;
      this.activePlayerPrizes = this.playerPrizes[this.activeIndex];
    }

    if(changes?.otherIndex?.currentValue !== undefined) {
      this.otherIndex = changes.otherIndex.currentValue;
      this.otherPlayerPrizes = this.playerPrizes[this.otherIndex];
    }
  }

  getTransferState() {
    return this.transferState
  }



  addPrize(prizeName: string) {
    if(['Forfeit', 'Take'].includes(prizeName)) {
       this.handleTransferPrize(prizeName)
    } else {
      this.addOrdinaryPrize(prizeName)
    }

  }

  handleTransferPrize(prizeName: string) {
    const currentPlayer = this.getPlayerName(this.activeIndex);
    const otherPlayer = this.getPlayerName(this.otherIndex);
    if(prizeName === 'Take')
    {
      if (this.playerPrizes[this.otherIndex].prizes.length > 0)
      {
        this.setMessage(`${currentPlayer}, you may take one of ${otherPlayer} \'s prizes`)
        this.transferState = 'Take';
      }
      else
      {
        this.setMessage(`${otherPlayer} has no prizes to take.`)
      }
    } else if(prizeName === 'Forfeit')
    {
      if (this.playerPrizes[this.activeIndex].prizes.length > 0)
      {
        this.setMessage(`${currentPlayer}, you must give ${otherPlayer} one of your prizes`);
        this.transferState = 'Forfeit';
      }
      else
      {
        this.setMessage(`You have no prizes to forfeit.`)
      }
    }
  }

  executeTransfer(prize: Prize, index:number) {
    const validTake = this.transferState === 'Take' && index === this.otherIndex;  // I've selected opponent's prize
    const validForfeit = this.transferState === 'Forfeit' && index === this.activeIndex // I've selected my own prize
    if (validTake || validForfeit) {
      const prizeName = this.removePrize(prize, index);
      const targetIndex = index === 0 ? 1 : 0;
      this.addOrdinaryPrize(prizeName, targetIndex)
      this.sentMessage.emit(undefined);
    }
  }

  removePrize(prize: Prize, index:number): string {
    if(prize.duplicate) {
       prize.duplicate = false;
    } else {
      this.playerPrizes[index].prizes = this.playerPrizes[index].prizes.filter(p => p.prize !== prize.prize)
    }
    return prize.prize;
  }

  addOrdinaryPrize(prizeName: string, index:0|1 = this.activeIndex) {
    const targetPrizeArray = this.playerPrizes[index].prizes
    this.transferState = null;
     const dupeTest = targetPrizeArray.find(prize => prize.prize === prizeName);
     if(dupeTest) {
       dupeTest.duplicate = true;
     } else {
       targetPrizeArray.push({prize: prizeName, duplicate: false})
     }
  }

  getPlayerName(index: 0|1) {
     return this.playerPrizes[index].player
  }

  clearPrizes(clearBoth: boolean = false) {
    if (this.playerPrizes[this.otherIndex]?.prizes) { this.playerPrizes[this.otherIndex].prizes = [];}
    if(clearBoth) {
      this.playerPrizes[this.activeIndex].prizes = [];
    }
  }

  setMessage(message: string) {
    this.sentMessage.emit(message);
  }

}
