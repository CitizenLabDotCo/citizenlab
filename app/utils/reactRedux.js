import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

export function preprocess(mapStateToProps, dispatchToProps, mergeProps) {
  let mapDispatchToProps = dispatchToProps;
  if (mapDispatchToProps && typeof mapDispatchToProps === 'object') {
    mapDispatchToProps = (dispatch) => bindActionCreators(dispatchToProps, dispatch);
  }
  return connect(mapStateToProps, mapDispatchToProps, mergeProps, { areMergedPropsEqual: () => true });
}
