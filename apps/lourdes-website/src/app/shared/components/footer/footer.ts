import { Component } from '@angular/core';
import { MenuItem } from '../../models/interfaces/menu-item.interface';
import { MENU_ITEMS } from '../../constants/menu-items';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
})
export class Footer {
  public routeItems: MenuItem[] = MENU_ITEMS;
}
