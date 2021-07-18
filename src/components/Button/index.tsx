import { FC } from 'react';
import { ButtonProps } from './types';
import './style.scss';

export const Button: FC<ButtonProps> = props => {
  const { color = "purple", onClick, children } = props;

  return (
    <button className={`Button Button__${color}`} onClick={onClick}>
      {children}
    </button>
  )
};