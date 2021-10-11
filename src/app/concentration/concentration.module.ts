import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GameOptionComponent } from './components/game-option/game-option.component';
import { NameEntryComponent } from './components/name-entry/name-entry.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { SolutionEntryComponent } from './components/solution-entry/solution-entry.component';
import { TrilonComponent } from './components/trilon/trilon.component';
import { ConcentrationComponent } from './concentration/concentration.component';

export function windowFactory() {
  return window;
}

@NgModule({
  declarations: [
    ConcentrationComponent,
    TrilonComponent,
    ScoreboardComponent,
    NameEntryComponent,
    SolutionEntryComponent,
    GameOptionComponent
  ],
    imports: [
        CommonModule, ReactiveFormsModule
    ],
  providers: [
    { provide: Window, useFactory: windowFactory }
  ],
  exports: [ConcentrationComponent]
})
export class ConcentrationModule { }
