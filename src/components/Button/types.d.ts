import { MouseEventHandler } from "react";

export interface ButtonProps {
  color?: "purple" | "red"
  onClick?: MouseEventHandler;
  disabled?: boolean;
}
