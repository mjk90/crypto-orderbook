import { ChangeEventHandler } from "react";

export interface DropdownOption {
  value: string | number;
  text: string;
}

export interface DropdownProps {
  value: string | number;
  onChange: ChangeEvent<HTMLSelectElement>;
  options: DropdownOption[];
  disabled?: boolean;
}
