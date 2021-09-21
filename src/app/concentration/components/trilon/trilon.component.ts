import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { REBUS_PATH } from '../../constants';
import { StyleObject, TrilonData } from '../../interfaces';

export const ADJ_TILE_WIDTH = 100;
export const ADJ_TILE_HEIGHT = 65; // dimensions including borders; used to calculate positions

@Component({
  selector: 'ca-trilon',
  templateUrl: './trilon.component.html',
  styleUrls: ['./trilon.component.scss']
})
export class TrilonComponent implements OnChanges {
  @Input() trilonData!: TrilonData
  @Input() puzzleUrl!: string;
  @Input() puzzleUrlHiRes?: string;
  prizeType: 'transfer' | 'wild' | 'prize' = 'prize'
  puzzleStyleObject!: StyleObject;

  constructor(private window: Window) { }

  ngOnChanges(changes:SimpleChanges): void {
    if(changes?.trilonData?.currentValue) {
      this.trilonData = changes.trilonData.currentValue;
      if(this.trilonData.prizeName === 'Wild') {
        this.prizeType = 'wild'
      }
      else if (['Take', 'Forfeit'].includes(this.trilonData.prizeName)) {
        this.prizeType = 'transfer'
      }
      this.generatePuzzleStyleObject();
    }
  }

  generatePuzzleStyleObject() {
    let adjustedTileHeight = ADJ_TILE_HEIGHT;
    let adjustedTileWidth = ADJ_TILE_WIDTH;
    let backgroundSize =  `492px 390px`

    const mobile = this.window.matchMedia('(max-width: 600px)')

    if(mobile.matches) {
      adjustedTileHeight = adjustedTileHeight *.6  + 1
      adjustedTileWidth = adjustedTileWidth * .6 + 1
      backgroundSize = `295px 234px`
    }

    const bgtop = -1 * (this.trilonData.row * adjustedTileHeight) + 'px';
    const bgleft = -1 * (this.trilonData.col * adjustedTileWidth) + 'px';
    let bgPath = `${REBUS_PATH}${this.puzzleUrl}`;

    const retina = this.window.matchMedia('(min-width: 792px) and (min-resolution: 192dpi)')


    if(retina.matches && this.puzzleUrlHiRes) {
      bgPath = `${REBUS_PATH}${this.puzzleUrlHiRes}`
    }

    this.puzzleStyleObject = {
      backgroundImage : `url(${bgPath})`,
      backgroundPosition: `${bgleft} ${bgtop}`,
      backgroundSize: backgroundSize
    }
  }

}
