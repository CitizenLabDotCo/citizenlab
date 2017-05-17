import React from 'react';
// import Show from './components/show';

import WatchSagas from 'containers/WatchSagas';
import { Saga } from 'react-redux-saga';

import indexSagas from 'containers/IdeasIndexPage/sagas';
import { loadAreasRequest } from 'containers/IdeasIndexPage/actions';

import sagas from './sagas';
import DemographicsForm from './components/demographicsForm';

import { store } from 'app';
import { bindActionCreators } from 'redux';

const dispatchable = (actions) => (element) => (props) => {
  const Element = element;
  const bindedActions = bindActionCreators(actions, store.dispatch);
  return <Element {...props} {...bindedActions} dispatch={store.dispatch} />;
};

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.loadAreasRequest()
  }

  render() {
    return (
      <div>
        <WatchSagas sagas={sagas} />
        <Saga saga={indexSagas.watchLoadAreas} />
        <DemographicsForm />
      </div>
    );
  }
}

export default dispatchable({ loadAreasRequest })(IdeasShow);
