import { Component, EventEmitter, Input, OnInit, AfterViewInit,  Output, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'ca-solution-entry',
  templateUrl: './solution-entry.component.html',
  styleUrls: ['./solution-entry.component.scss']
})
export class SolutionEntryComponent implements OnInit, AfterViewInit  {
  @Input() showGiveUp = false;
  @Output() solutionProposed: EventEmitter<string|null> = new EventEmitter<string | null>()
  @Output() giveUpGame: EventEmitter<void> = new EventEmitter<void>()
  solutionForm!: FormGroup;

  @ViewChild("solutionInput") solutionInput!: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.solutionForm = new FormGroup({
      solution: new FormControl('', [ Validators.required,])
    });
  }

  ngAfterViewInit() {
    this.solutionInput.nativeElement.focus();
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
