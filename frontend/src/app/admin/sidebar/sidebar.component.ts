import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None

  
})

export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
 
  @Output() menuIndex = new EventEmitter<number>();
  public stateList: boolean[] = [true, false, false, false, false, false, false, false];
  public display: boolean = true;

  panelOpenState = false;
  constructor(config: NgbAccordionConfig) { config.closeOthers = true;
		//config.type = 'info';
  }
 
  ngOnInit(): void {
 this.menuItems = this.getMenuItems()   
}

getMenuItems() {

  {
    return [
     // { index: 0, icon: 'dashboard', label: 'Tableau de bord' },
      {
        // index: 1,
        icon: 'newspaper',
        label: 'Notes',
        subitems: [
          { index: 0, label: 'ajout note' },
          { index: 1, label: 'Mes notes' },
        ],
      },
      {
        //  index: 4,
        icon: 'storefront',
        label: 'Boutique',
        subitems: [
          { index: 2, label: 'ajout produits' },
          { index: 3, label: 'Liste produits' },
          { index: 4, label: 'Commandes' },

        ],
      },
    ];
  }

}


public async switchMemu(index: number) {
  this.stateList = [false, false, false, false, false, false, false, false];
  this.stateList[index] = true;
  this.menuIndex.emit(index);
  return index;
}


}
