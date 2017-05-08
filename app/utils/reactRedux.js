import { connect } from 'react-redux';

export function preprocess(...args) {
  return connect(...args, { areMergedPropsEqual: () => true });
}
