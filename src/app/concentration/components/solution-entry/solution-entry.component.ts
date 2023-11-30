import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'ca-solution-entry',
  templateUrl: './solution-entry.component.html',
  styleUrls: ['./solution-entry.component.scss']
})
export class SolutionEntryComponent implements OnInit {
  @Input() showGiveUp = false;
  @Output() solutionProposed: EventEmitter<string|null> = new EventEmitter<string | null>()
  @Output() giveUpGame: EventEmitter<void> = new EventEmitter<void>()
  solutionForm!: FormGroup;
  constructor() { }

  ngOnInit(): void {
    this.solutionForm = new FormGroup({
      solution: new FormControl('', [ Validators.required,])
    });
  }

  checkSolution(evt: Event) {
    if(evt) {
      evt.preventDefault();
    }
    // @ts-ignore
    this.solutionProposed.emit(this.solutionForm.get('solution').value)
  }

  cancelSolve() {
    this.solutionProposed.emit(null)
  }

  giveUp() {
    this.giveUpGame.emit()
  }

}
