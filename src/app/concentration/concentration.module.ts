import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NameEntryComponent } from './components/name-entry/name-entry.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { TrilonComponent } from './components/trilon/trilon.component';
import { ConcentrationComponent } from './concentration/concentration.component';



@NgModule({
  declarations: [
    ConcentrationComponent,
    TrilonComponent,
    ScoreboardComponent,
    NameEntryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [ConcentrationComponent]
})
export class ConcentrationModule { }
