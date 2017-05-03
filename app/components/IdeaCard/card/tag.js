import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Label } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';

import { selectResourcesDomain } from 'utils/resources/selectors';

import T from 'containers/T';


const colors = [
  'red', 'orange', 'yellow', 'olive', 'green', 'teal',
  'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black',
];

const Tag = ({ title, color }) => {
  if (!title) return null;
  return (
    <Label color={color} style={{ marginBottom: '5px' }}>
      <T value={title} />
    </Label>
  );
};

Tag.propTypes = {
  color: PropTypes.string,
  title: ImmutablePropTypes.map,
};

const mapStateToProps = () => createStructuredSelector({
  tag: (state, { type, tag }) => {
    const id = tag.get('id');
    return selectResourcesDomain(type, id)(state);
  },
});

const mergeProps = ({ tag }, dispatchProps, ownProps) => {
  if (!tag) return {};
  const color = colors[Math.floor(Math.random() * 15)];
  const title = tag.getIn(['attributes', 'title_multiloc']);
  return { title, color, ...ownProps };
};

export default connect(mapStateToProps, null, mergeProps)(Tag);
