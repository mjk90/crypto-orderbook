import React, { FC } from 'react';
import { ButtonProps } from './types';
import './style.scss';

export const Button: FC<ButtonProps> = props => {
  const { color = "purple", onClick, children, disabled = false } = props;

  return (
    <button disabled={disabled} className={`Button Button__${color}`} onClick={onClick}>
      {children}
    </button>
  )
};
