import {
  DropdownActionsComponent,
  DropdownUserComponent,
  DropdownMenuDotsComponent,
} from './dropdown-presets.component';
import { DropdownComponent } from './dropdown.component';

export * from './dropdown.types';
export { DropdownComponent } from './dropdown.component';
export {
  DropdownActionsComponent,
  DropdownUserComponent,
  DropdownMenuDotsComponent,
} from './dropdown-presets.component';

export const DROPDOWN_COMPONENTS = [
  DropdownComponent,
  DropdownActionsComponent,
  DropdownUserComponent,
  DropdownMenuDotsComponent,
] as const;
