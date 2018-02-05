import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { FormattedMessage } from 'utils/cl-intl';
import WatchSagas from 'utils/containers/watchSagas';

// Components
import Button from 'components/UI/Button';
import PageWrapper from 'components/admin/PageWrapper';
import IdeaManager from 'components/admin/IdeaManager';

// import ExportLabel from 'components/admin/ExportLabel';
import { loadIdeasXlsxRequest, loadCommentsXlsxRequest } from './actions';
import messages from './messages';
import sagas from './sagas';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const HeaderTitle = styled.h1`
  color: #333;
  font-size: 35px;
  line-height: 40px;
  font-weight: 600;
  margin: 0;
  padding: 0;
`;

const ExportLabelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .no-padding-right button {
    padding-right: 0;
    padding-top: .25em;
    padding-bottom: .25em;
  }
`;

class AllIdeas extends PureComponent {
  render() {
    return (
      <div>
        <WatchSagas sagas={sagas} />
        <HeaderContainer>
          <HeaderTitle>
            <FormattedMessage {...messages.header} />
          </HeaderTitle>
          <ExportLabelsContainer>
            <Button
              className="no-padding-right"
              style={this.props.exportIdeasError ? 'error' : 'text'}
              onClick={this.props.loadIdeasXlsxRequest}
              loading={this.props.exportIdeasLoading}
              error={this.props.exportIdeasError}
            >
              <FormattedMessage {...messages.exportIdeas} />
            </Button>
            <Button
              className="no-padding-right"
              style={this.props.exportCommentsError ? 'error' : 'text'}
              onClick={this.props.loadCommentsXlsxRequest}
              loading={this.props.exportCommentsLoading}
            >
              <FormattedMessage {...messages.exportComments} />
            </Button>
          </ExportLabelsContainer>
        </HeaderContainer>
        <PageWrapper>
          <IdeaManager />
        </PageWrapper>
      </div>
    );
  }
}

AllIdeas.propTypes = {
  loadIdeasXlsxRequest: PropTypes.func.isRequired,
  loadCommentsXlsxRequest: PropTypes.func.isRequired,
  exportIdeasLoading: PropTypes.bool.isRequired,
  exportCommentsLoading: PropTypes.bool.isRequired,
  exportIdeasError: PropTypes.string,
  exportCommentsError: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  exportIdeasLoading: (state) => state.getIn(['adminIdeasIndex', 'exportIdeasLoading']),
  exportCommentsLoading: (state) => state.getIn(['adminIdeasIndex', 'exportCommentsLoading']),
  exportIdeasError: (state) => state.getIn(['adminIdeasIndex', 'exportIdeasError']),
  exportCommentsError: (state) => state.getIn(['adminIdeasIndex', 'exportCommentsError']),
});

const mapDispatchToProps = {
  loadIdeasXlsxRequest,
  loadCommentsXlsxRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(AllIdeas);
