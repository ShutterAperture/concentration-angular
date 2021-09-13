import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PlayerData } from '../../interfaces';

@Component({
  selector: 'ca-name-entry',
  templateUrl: './name-entry.component.html',
  styleUrls: [ './name-entry.component.scss' ]
})
export class NameEntryComponent implements OnInit {
  @Output() playerData: EventEmitter<PlayerData> = new EventEmitter<PlayerData>();
  entryForm!: FormGroup;

  constructor() {
  }

  ngOnInit(): void {
    this.entryForm = new FormGroup({
      player1: new FormControl('', [ Validators.required, Validators.maxLength(20) ]),
      player2: new FormControl('', [ Validators.required, Validators.maxLength(20) ])
    });
  }

  setSingle() {
    this.playerData.emit({
      singleMode: true,
      players: []
    });
    this.clearForm();
  }

  setTwoHanded() {
    this.playerData.emit({
      singleMode: false,
      players: Object.values(this.entryForm.value)
    });
    this.clearForm();
  }

  clearForm() {
    Object.values(this.entryForm.controls).forEach(ctrl => ctrl.patchValue(''))
  }

}
