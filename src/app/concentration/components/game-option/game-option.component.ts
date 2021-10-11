import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DEFAULT_GAME_OPTIONS } from '../../constants';
import { GameOptions } from '../../interfaces';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'ca-game-option',
  templateUrl: './game-option.component.html',
  styleUrls: ['./game-option.component.scss'],
  animations: [
    trigger('insertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }), animate('100ms', style({ opacity: 1 }))
      ]), transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class GameOptionComponent implements OnInit, OnDestroy {


  gameOptions!: GameOptions
  @Output() optionChanged: EventEmitter<GameOptions> = new EventEmitter<GameOptions>()

  @HostListener('window:click', ['$event'])
  hideOnClick(event: Event) {
    if(this.showMenu && !this.element.nativeElement.contains(event.target)) {
      this.toggleMenu(event, false)
    }
  }

  optionForm: FormGroup = new FormGroup({volume: new FormControl(), narzAppearance: new FormControl(), blumenthalPuzzles: new FormControl()});
  destroyed$: Subject<void> = new Subject<void>()
  showMenu = false;
  constructor(
    private element: ElementRef,
    private localStorageService: LocalStorageService) { }

  public ngOnInit() {
    this.subscribeToChanges();
    const gameOptions = this.localStorageService.getObject<GameOptions>('gameOptions');
    this.gameOptions = gameOptions ?? {...DEFAULT_GAME_OPTIONS};
    this.optionForm.patchValue(this.gameOptions);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  resetOptions(): void {
    this.gameOptions =  {...DEFAULT_GAME_OPTIONS};
    this.optionForm.patchValue(this.gameOptions);
    this.showMenu = false;
  }

  subscribeToChanges() {
    this.optionForm.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(changes => {
        this.gameOptions = {...changes, enableSound: changes.volume > 0};
        this.localStorageService.setObject<GameOptions>('gameOptions', this.gameOptions)
        this.optionChanged.emit(this.gameOptions)
      })
  }

  toggleMenu (event: Event, stopPropagation: boolean) {
    if(event && stopPropagation) {
      event.stopPropagation();
    }
    this.showMenu = !this.showMenu
  }

}
