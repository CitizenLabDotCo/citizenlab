import React from 'react';

export const PreviousPathnameContext = React.createContext<string | null>(null);
export const EditModeContext = React.createContext({
  mode: false,
  onStartEditMode: () => {},
  onStopEditMode: () => {},
});
