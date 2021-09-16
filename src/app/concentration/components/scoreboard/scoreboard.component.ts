import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ca-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  @Input() players: string[] = [];
  @Input() singleMode =  false;
  @Output() sentMessage: EventEmitter<string> = new EventEmitter<string>();


  currentPlayerIndex = 0 //holds index number of current player
  otherPlayerIndex = 1 //holds index number of opponent
  transferState: any;
  constructor() { }

  ngOnInit(): void {
  }

  switchPlayer(){}

  addPrize(prizeName: string) {

  }

  setTransferState(state: any) {

  }

  clearPrizes(data: any) {
     alert(data)
  }

}
