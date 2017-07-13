import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';

// components
import { FormattedMessage } from 'react-intl';
// import ActionButton from 'components/buttons/action.js';
import IdeasBorad from 'containers/IdeasIndexPage/pageView';

// store
import { preprocess } from 'utils';

// messages
import messages from './messages';
import { loadCommentsXlsxRequest, loadIdeasXlsxRequest } from '../actions';
import { createStructuredSelector } from 'reselect';
import { LOAD_COMMENTS_XLSX_REQUEST, LOAD_IDEAS_XLSX_REQUEST } from '../constants';
import ExportLabel from '../components/ExportLabel';
import sagas from '../sagas';
import WatchSagas from 'containers/WatchSagas';

const AllIdeas = ({ exportIdeas, exportComments, exportingIdeas, exportingComments, ideasExportError, commentsExportError }) => (<div>
  <WatchSagas sagas={sagas} />
  <Grid>
    <Grid.Row>
      <Grid.Column width={10}>
        <h1>
          <FormattedMessage {...messages.headerIndex} />
        </h1>
      </Grid.Column>
      <Grid.Column width={6}>
        <ExportLabel
          action={exportIdeas}
          labelId="exportIdeas"
          loading={exportingIdeas}
          error={ideasExportError}
        />
        <ExportLabel
          action={exportComments}
          labelId="exportComments"
          loading={exportingComments}
          error={commentsExportError}
        />
      </Grid.Column>
    </Grid.Row>
  </Grid>
  <IdeasBorad />
</div>);

const mapStateToProps = createStructuredSelector({
  exportingIdeas: (state) => state.getIn(['tempState', LOAD_IDEAS_XLSX_REQUEST, 'loading']),
  ideasExportError: (state) => state.getIn(['tempState', LOAD_IDEAS_XLSX_REQUEST, 'error']),
  exportingComments: (state) => state.getIn(['tempState', LOAD_COMMENTS_XLSX_REQUEST, 'loading']),
  commentsExportError: (state) => state.getIn(['tempState', LOAD_COMMENTS_XLSX_REQUEST, 'error']),
});

AllIdeas.propTypes = {
  exportIdeas: PropTypes.func.isRequired,
  exportComments: PropTypes.func.isRequired,
  exportingIdeas: PropTypes.bool,
  exportingComments: PropTypes.bool,
  ideasExportError: PropTypes.bool,
  commentsExportError: PropTypes.bool,
};

export default preprocess(mapStateToProps, { exportIdeas: loadIdeasXlsxRequest, exportComments: loadCommentsXlsxRequest })(AllIdeas);

