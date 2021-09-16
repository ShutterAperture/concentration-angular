import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NameEntryComponent } from './components/name-entry/name-entry.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { TrilonComponent } from './components/trilon/trilon.component';
import { ConcentrationComponent } from './concentration/concentration.component';
import { SolutionEntryComponent } from './components/solution-entry/solution-entry.component';

export function windowFactory() {
  return window;
}

@NgModule({
  declarations: [
    ConcentrationComponent,
    TrilonComponent,
    ScoreboardComponent,
    NameEntryComponent,
    SolutionEntryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: Window, useFactory: windowFactory }
  ],
  exports: [ConcentrationComponent]
})
export class ConcentrationModule { }
