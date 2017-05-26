import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import WatchSagas from 'containers/WatchSagas';
import { Saga } from 'react-redux-saga';

import indexSagas from 'containers/IdeasIndexPage/sagas';
import { loadAreasRequest } from 'containers/IdeasIndexPage/actions';

import { dispatchable } from 'utils/dispatchable';

import sagas from './sagas';
import DemographicsForm from './components/demographicsForm';

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.loadAreasRequest();
  }

  render() {
    return (
      <div>
        <Helmet
          title="Complete registration page"
          meta={[
            { name: 'description', content: 'Complete registration' },
          ]}
        />
        <WatchSagas sagas={sagas} />
        <Saga saga={indexSagas.watchLoadAreas} />
        <DemographicsForm />
      </div>
    );
  }
}

IdeasShow.propTypes = {
  loadAreasRequest: PropTypes.func.isRequied,
};

export default dispatchable({ loadAreasRequest })(IdeasShow);
