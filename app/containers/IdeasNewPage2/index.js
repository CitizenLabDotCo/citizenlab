import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Dropdown } from 'semantic-ui-react';
import styled from 'styled-components';
import _ from 'lodash';
import { preprocess } from 'utils';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';
import WatchSagas from 'containers/WatchSagas';
import sagas from './sagas';
import { loadTopics, loadAreas, loadProjects } from './actions';
import { makeSelectTopics, makeSelectAreas, makeSelectProjects } from './selectors';
import messages from './messages';

import MultipleSelect from './components/multipleselect';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f2f2f2;
`;

const PageTitle = styled.h2`
  color: #333;
  font-size: 34px;
  font-weight: 500;
  margin-top: 50px;
  margin-bottom: 50px;
`;

class IdeasNewPage2 extends React.Component {
  constructor() {
    super();

    this.state = {
      topicsMultipleSelectValue: [],
      areasMultipleSelectValue: [],
      projectsMultipleSelectValue: [],
    };
  }

  componentDidMount() {
    this.props.loadTopics();
    this.props.loadAreas();
    this.props.loadProjects();
  }

  getOptions(list) {
    const options = [];

    if (list && list.size && list.size > 0) {
      list.forEach((item) => {
        const id = item.get('id');
        const title = this.props.tFunc(item.getIn(['attributes', 'title_multiloc']).toJS());

        options.push({
          key: id,
          value: id,
          text: title,
        });
      });
    }

    return options;
  }

  /*
  handleChange = (collectionName) => (event, data) => {
    this.setState((oldState) => {
      let value = data.value;
      const statePropertyName = `${collectionName}MultipleSelectValue`;

      if (_.has(data, 'value.length') && _.has(data, 'data-max-items')) {
        const newItemsCount = data.value.length;
        const maxItemsCount = parseInt(data['data-max-items'], 10);
        value = (newItemsCount > maxItemsCount ? oldState[statePropertyName] : value);
      }

      return { [statePropertyName]: value };
    });
  }
  */

  handleChange = (collectionName) => (value) => {
    this.setState({ [`${collectionName}MultipleSelectValue`]: value });
  }

  render() {
    const { formatMessage } = this.props.intl;

    return (
      <div>
        <WatchSagas sagas={sagas} />

        <Container>
          <PageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </PageTitle>

          <MultipleSelect
            value={this.state.topicsMultipleSelectValue}
            placeholder={formatMessage({ ...messages.topicsPlaceholder })}
            options={this.getOptions(this.props.topics)}
            max="3"
            onChange={this.handleChange('topics')}
          />

          {/*
          <Dropdown
            closeOnChange
            multiple
            scrolling
            selection
            fluid
            data-max-items="3"
            value={this.state.topicsMultipleSelectValue}
            placeholder={formatMessage({ ...messages.topicsPlaceholder })}
            options={this.getOptions(this.props.topics)}
            onChange={this.handleChange('topics')}
          />

          <Dropdown
            closeOnChange
            multiple
            scrolling
            selection
            fluid
            data-max-items="3"
            value={this.state.areasMultipleSelectValue}
            placeholder={formatMessage({ ...messages.areasPlaceholder })}
            options={this.getOptions(this.props.areas)}
            onChange={this.handleChange('areas')}
          />

          <Dropdown
            closeOnChange
            multiple
            scrolling
            selection
            fluid
            data-max-items="1"
            value={this.state.projectsMultipleSelectValue}
            placeholder={formatMessage({ ...messages.projectsPlaceholder })}
            options={this.getOptions(this.props.projects)}
            onChange={this.handleChange('projects')}
          />
          */}



          {/*
          <MultiSelectT
            options={this.multiselectMap(this.props.topics)}
            maxSelectionLength={3}
            placeholder={formatMessage({ ...messages.topicsPlaceholder })}
            optionLabel={formatMessage({ ...messages.topicsLabel })}
            handleOptionsAdded={this.storeTopics}
          />
          */}

        </Container>
      </div>
    );
  }
}

IdeasNewPage2.propTypes = {
  intl: intlShape.isRequired,
  tFunc: PropTypes.func.isRequired,
  topics: ImmutablePropTypes.list.isRequired,
  areas: ImmutablePropTypes.list.isRequired,
  projects: ImmutablePropTypes.list.isRequired,
  loadTopics: PropTypes.func.isRequired,
  loadAreas: PropTypes.func.isRequired,
  loadProjects: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  topics: makeSelectTopics(),
  areas: makeSelectAreas(),
  projects: makeSelectProjects(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadTopics,
  loadAreas,
  loadProjects,
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { topics, areas, projects } = stateProps;
  return {
    topics,
    areas,
    projects,
    ...dispatchProps,
    ...ownProps,
  };
};

export default injectTFunc(injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(IdeasNewPage2)));
