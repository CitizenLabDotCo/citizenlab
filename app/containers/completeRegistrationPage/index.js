import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

import WatchSagas from 'containers/WatchSagas';
import { Saga } from 'react-redux-saga';

import indexSagas from 'containers/IdeasIndexPage/sagas';
import { loadAreasRequest } from 'containers/IdeasIndexPage/actions';

import { dispatchable } from 'utils/dispatchable';

import sagas from './sagas';
import DemographicsForm from './components/demographicsForm';
import messages from './messages';

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.props.loadAreasRequest();
  }

  render() {
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
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
