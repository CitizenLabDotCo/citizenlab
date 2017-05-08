import React from 'react';
import PropTypes from 'prop-types';
import { Saga } from 'react-redux-saga';


const WatchSagas = ({ sagas }) => (
  <span>
    {Object.keys(sagas).map((name) => <Saga key={name} saga={sagas[name]} />)}
  </span>
);

WatchSagas.propTypes = {
  sagas: PropTypes.object.isRequired,
};

export default WatchSagas;
