import React, { FC } from 'react';
import './style.scss';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = (props: LoadingSpinnerProps) => 
  <div className={`lds-ring ${props.className}`}><div></div><div></div><div></div><div></div></div>
;