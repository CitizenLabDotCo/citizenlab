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

const ExportButtons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const ExportIdeasButton = styled(Button)`
  margin-right: 10px;
`;

const ExportCommentsButton = styled(Button)``;

class AllIdeas extends PureComponent {
  render() {
    return (
      <div>
        <WatchSagas sagas={sagas} />
        <HeaderContainer>
          <HeaderTitle>
            <FormattedMessage {...messages.header} />
          </HeaderTitle>
          <ExportButtons>
            <ExportIdeasButton
              style={this.props.exportIdeasError ? 'error' : 'cl-blue'}
              icon="download"
              onClick={this.props.loadIdeasXlsxRequest}
              processing={this.props.exportIdeasLoading}
              circularCorners={false}
            >
              <FormattedMessage {...messages.exportIdeas} />
            </ExportIdeasButton>
            <ExportCommentsButton
              style={this.props.exportCommentsError ? 'error' : 'cl-blue'}
              icon="download"
              onClick={this.props.loadCommentsXlsxRequest}
              processing={this.props.exportCommentsLoading}
              circularCorners={false}
            >
              <FormattedMessage {...messages.exportComments} />
            </ExportCommentsButton>
          </ExportButtons>
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
