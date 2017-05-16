import React from 'react';
//import Show from './components/show';

import WatchSagas from 'containers/WatchSagas';
import sagas from './sagas'

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
      <WatchSagas sagas={sagas} />
      asdf
        {/*<Show />*/}
      </div>
    );
  }
}

export default IdeasShow;
