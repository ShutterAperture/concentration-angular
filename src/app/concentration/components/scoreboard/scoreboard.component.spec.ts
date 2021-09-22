import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Prize } from '../../interfaces';

import { ScoreboardComponent } from './scoreboard.component';

describe('ScoreboardComponent', () => {
  let component: ScoreboardComponent;
  let fixture: ComponentFixture<ScoreboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [ ScoreboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should set up the player prizes when passed an array of player names', () => {
      const change = new SimpleChange(null, ['Tom', 'Becky'], true);
      component.ngOnChanges({players: change});
      const expected = [
        {player: 'Tom', prizes: []},
        {player: 'Becky', prizes: []}
      ]
      expect(component.playerPrizes).toEqual(expected);
    })
    it('should set the active index', () => {
      component.playerPrizes =  [
        {player: 'Scott', prizes: []},
        {player: 'Marty', prizes: []}
      ]
      const change = new SimpleChange(null, 1, true);
      component.ngOnChanges({activeIndex: change});
      expect(component.activeIndex).toBe(1);
      expect(component.activePlayerPrizes).toEqual({player: 'Marty', prizes: []})
    })
    it('should set the other index', () => {
      component.playerPrizes =  [
        {player: 'Scott', prizes: []},
        {player: 'Marty', prizes: []}
      ]
      const change = new SimpleChange(null, 0, true);
      component.ngOnChanges({otherIndex: change})
      expect(component.otherIndex).toBe(0);
      expect(component.otherPlayerPrizes).toEqual({player: 'Scott', prizes: []})
    })
  });

  describe('getTransferState', () => {
    it('should return the internal transfer state', () => {
      component.transferState = 'Take';
      const result = component.getTransferState();
      expect(result).toBe('Take')
    })
  });

  describe('addPrize', () => {
    const transferPrizes = [ 'Forfeit', 'Take' ];
    beforeEach(() => {
      spyOn(component, 'handleTransferPrize')
      spyOn(component, 'addOrdinaryPrize')
    })
    transferPrizes.forEach((prize: string)  => {
      it(`should call handleTransferPrize when passed ${prize}`, () => {
        component.addPrize(prize);
        expect(component.handleTransferPrize).toHaveBeenCalledWith(prize);
        expect(component.addOrdinaryPrize).not.toHaveBeenCalled();
      })
    })

    it('should call addOrdinaryPrize when called with an ordinary prize', () => {
      const prize = '10 Speed Bike'
      component.addPrize(prize);
      expect(component.handleTransferPrize).not.toHaveBeenCalled();
      expect(component.addOrdinaryPrize).toHaveBeenCalledWith(prize);
    })

  });

  describe('handleTransferPrize', () => {
    const prizeSet: Prize[] = [
      {prize: 'Cool Prize', duplicate: false},
      {prize: 'Gag Prize', duplicate: false}
    ]

    beforeEach(() => {
      component.playerPrizes = [
        {player: 'Ben', prizes: []},
        {player: 'John', prizes: []}
      ]
      component.activeIndex = 0;
      component.otherIndex = 1;
      component.transferState = null;
      spyOn(component, 'setMessage')
    });

    it('should handle Taking if the opponent has prizes', () => {
      component.playerPrizes[1].prizes = [...prizeSet];
      component.handleTransferPrize('Take')
      expect(component.setMessage).toHaveBeenCalledWith(`Ben, you may take one of John's prizes`);
      expect(component.transferState).toBe('Take')

    })
    it('should dismiss Taking if the opponent has no prizes', () => {
      component.playerPrizes[1].prizes = [];
      component.handleTransferPrize('Take')
      expect(component.setMessage).toHaveBeenCalledWith('John has no prizes to take.');
      expect(component.transferState).toBe(null)
    })

    it('should handle Forfeiting if the player has prizes', () => {
      component.playerPrizes[0].prizes = [...prizeSet];
      component.handleTransferPrize('Forfeit')
      expect(component.setMessage).toHaveBeenCalledWith(`Ben, you must give John one of your prizes.`);
      expect(component.transferState).toBe('Forfeit')
    })
    it('should dismiss Forfeiting if the player has no prizes', () => {
      component.playerPrizes[0].prizes = [];
      component.handleTransferPrize('Forfeit')
      expect(component.setMessage).toHaveBeenCalledWith('You have no prizes to forfeit.');
      expect(component.transferState).toBe(null)
    })
  });

  describe('executeTransfer', () => {
    let base: any;
    beforeEach(() => {
      base = [
        {player: 'Ben', prizes: [
            {prize: 'Laptop', duplicate: false},
            {prize: 'A Valise of Grease', duplicate: false}
          ]},
        {player: 'John', prizes: [
            {prize: 'Trip', duplicate: false},
            {prize: 'Trunk of Junk', duplicate: false}
          ]}
      ]
      component.playerPrizes = [...base]
      component.activeIndex = 0;
    })

    afterEach(() => base = undefined)

    it('should transfer from the opponent to the current player when transfer state is take', () => {
      component.transferState = 'Take';
      const expected = [
        {player: 'Ben', prizes: [
            {prize: 'Laptop', duplicate: false},
            {prize: 'A Valise of Grease', duplicate: false},
            {prize: 'Trip', duplicate: false}
          ]},
        {player: 'John', prizes: [
            {prize: 'Trunk of Junk', duplicate: false}
          ]}
      ]
      component.executeTransfer({prize: 'Trip', duplicate: false}, 1);
      expect(component.playerPrizes).toEqual(expected)
    })
    it('should transfer from the current player to the opponent when transfer state is Forfeit', () => {
      component.transferState = 'Forfeit';
      const expected = [
        {player: 'Ben', prizes: [
            {prize: 'Laptop', duplicate: false}
          ]},
        {player: 'John', prizes: [
            {prize: 'Trip', duplicate: false},
            {prize: 'Trunk of Junk', duplicate: false},
            {prize: 'A Valise of Grease', duplicate: false}
          ]}
      ]
      component.executeTransfer({prize: 'A Valise of Grease', duplicate: false}, 0);
      expect(component.playerPrizes).toEqual(expected)
    })
    it('should do nothing in an invalid state', () => {
      component.transferState = 'Take';
      component.executeTransfer({prize: 'Trip', duplicate: false}, 0);
      expect(component.playerPrizes).toEqual(base)
    })
  });

  describe('removePrize', () => {
    it('should clear the duplicate flag if one exists', () => {
      const targetPrize = {prize: 'Cool Prize', duplicate: true}
      component.playerPrizes = [
        {player: 'Ben', prizes: [
            targetPrize,
            {prize: 'Gag Prize', duplicate: false}
          ]},
        {player: 'John', prizes: []}
      ]
      component.removePrize(targetPrize, 0)
      expect(targetPrize.duplicate).toBe(false);

    })
    it('should remove the prize if only one is present', () => {
      const targetPrize = {prize: 'Gag Prize', duplicate: false}
      component.playerPrizes = [
        {player: 'Ben', prizes: [
            targetPrize,
            {prize: 'Cool Prize', duplicate: false}
          ]},
        {player: 'John', prizes: []}
      ]
      component.removePrize(targetPrize, 0);
      expect(component.playerPrizes[0].prizes).toEqual([{prize: 'Cool Prize', duplicate: false}])

    })
  });

  describe('addOrdinaryPrize', () => {
    it('should mark the prize as a duplicate if already present', () => {

      component.playerPrizes = [
        {player: 'Ben', prizes: [
            {prize: 'Gag Prize', duplicate: false},
            {prize: 'Cool Prize', duplicate: false}
          ]},
        {player: 'John', prizes: []}
      ]

      component.addOrdinaryPrize('Cool Prize', 0)
      const expected = [
        {prize: 'Gag Prize', duplicate: false},
        {prize: 'Cool Prize', duplicate: true}
      ]
      expect(component.playerPrizes[0].prizes).toEqual(expected);
    })
    it('should add the prize to the prize array if not already present.', () => {
      component.playerPrizes = [
        {player: 'Ben', prizes: [
            {prize: 'Gag Prize', duplicate: false},
            {prize: 'Cool Prize', duplicate: false}
          ]},
        {player: 'John', prizes: []}
      ]

      component.addOrdinaryPrize('New Prize', 0);
      const expected = [
        {prize: 'Gag Prize', duplicate: false},
        {prize: 'Cool Prize', duplicate: false},
        {prize: 'New Prize', duplicate: false}
      ]
      expect(component.playerPrizes[0].prizes).toEqual(expected);
    })
  });

  describe('getPlayerName', () => {
    it('should return the name of the player at the passed position', () => {
      component.playerPrizes = [
        {player: 'Stan', prizes: []},
        {player: 'Ollie', prizes: []}
      ]

      const result = component.getPlayerName(1);
      expect(result).toBe('Ollie')
    })
  });

  describe('clearPrizes', () => {
    let base: any;
    beforeEach(() => {
      base = [
        {player: 'Ben', prizes: [
            {prize: 'Laptop', duplicate: false},
            {prize: 'A Valise of Grease', duplicate: false}
          ]},
        {player: 'John', prizes: [
            {prize: 'Trip', duplicate: false},
            {prize: 'Trunk of Junk', duplicate: false}
          ]}
      ]
      component.playerPrizes = [...base]
      component.activeIndex = 0;
    })

    afterEach(() => base = undefined)

    it('should clear only the opponent\'s prizes when clearBoth is false', () => {
      const expected =  [
        {player: 'Ben', prizes: [
            {prize: 'Laptop', duplicate: false},
            {prize: 'A Valise of Grease', duplicate: false}
          ]},
        {player: 'John', prizes: []}
      ]
      component.clearPrizes(false);
      expect(component.playerPrizes).toEqual(expected)
    });
    it('should clear all prizes when clearBoth is true', () => {
      const expected =  [
        {player: 'Ben', prizes: []},
        {player: 'John', prizes: []}
      ]
      component.clearPrizes(true);
      expect(component.playerPrizes).toEqual(expected)
    })
  });

  describe('setMessage', () => {
    it('should cause the passed message to be emitted', () => {
      spyOn(component.sentMessage, 'emit');
      component.setMessage('This is a test. It is only a test');
      expect(component.sentMessage.emit).toHaveBeenCalledWith('This is a test. It is only a test')
    })
  });
});
