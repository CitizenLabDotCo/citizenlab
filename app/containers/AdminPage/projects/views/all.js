import React from 'react';
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import Item from './all/item';
import { FormattedMessage } from 'react-intl';
import ActionButton from 'components/buttons/action.js';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';


import messages from './messages';

const AllProjects = ({ projects, goTo }) => (
  <div>
    <h1>
      <FormattedMessage {...messages.headerIndex} />
    </h1>
    <div style={{ clear: 'both', overflow: 'auto' }}>
      <ActionButton action={() => goTo('/admin/projects/create')} message={messages.createButton} fluid />
    </div>
    {projects.map((id) => <Item key={id} projectId={id} />)}
  </div>
);


AllProjects.propTypes = {
  projects: ImmutablePropTypes.list.isRequired,
  goTo: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  projects: (state) => state.getIn(['adminProjects', 'projects']),
});

export default preprocess(mapStateToProps, { goTo: push })(AllProjects);
