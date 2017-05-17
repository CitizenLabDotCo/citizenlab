import React from 'react';
import { bindActionCreators } from 'redux';
import { store } from 'app';

export const dispatchable = (actions) => (element) => (props) => {
  const Element = element;
  const bindedActions = bindActionCreators(actions, store.dispatch);
  return <Element {...props} {...bindedActions} dispatch={store.dispatch} />;
};
