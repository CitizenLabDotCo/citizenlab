import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Card, Feed } from 'semantic-ui-react';

import Tag from './tag';

const Tags = ({ tags, type }) => (
  <Card style={{ margin: 0, borderRadius: 0, boxShadow: 'none' }}>
    <Card.Content>
      <Card.Description>
        <Feed.Label />
        <Card.Description style={{ marginBottom: '5px' }}>
          {tags.map((tag) => <Tag key={tag.get('id')} type={type} tag={tag} />)}
        </Card.Description>
      </Card.Description>
    </Card.Content>
  </Card>
);

Tags.propTypes = {
  tags: ImmutablePropTypes.list,
  type: PropTypes.string.isRequired,
};

export default Tags;

