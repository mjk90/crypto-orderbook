import React, { FC } from 'react';
import { DropdownOption, DropdownProps } from './types';
import './style.scss';

export const Dropdown: FC<DropdownProps> = props => {
  const { onChange, options, value } = props;

  return (
    <select className="Dropdown" value={value} onChange={onChange}>
      {options.map((option: DropdownOption) => <option value={option.value}>{option.text}</option> )}
    </select>
  )
};
