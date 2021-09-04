import React, { FC } from 'react';
import './style.scss';

interface LoadingSpinnerProps {
  className?: string;
  testid?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = (props: LoadingSpinnerProps) => 
  <div data-testid={props.testid} className={`lds-ring ${props.className || ""}`}><div></div><div></div><div></div><div></div></div>
;
