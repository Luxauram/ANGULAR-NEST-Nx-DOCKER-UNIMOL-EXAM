export interface DropdownItem {
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
  href?: string;
  routerLink?: string | string[];
}

export interface DropdownSection {
  items: DropdownItem[];
  title?: string;
}

export interface DropdownConfig {
  buttonText?: string;
  buttonClass?: string;
  menuClass?: string;
  position?: 'left' | 'right';
  width?: string;
  showChevron?: boolean;
}
