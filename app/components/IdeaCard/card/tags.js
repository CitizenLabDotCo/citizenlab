/**
*
* IdeaCard
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Label, Feed } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';

import { selectResourcesDomain } from 'utils/resources/selectors';

import T from 'containers/T';


const colors = [
  'red', 'orange', 'yellow', 'olive', 'green', 'teal',
  'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black',
];

const getTagData = (tag, resources) => {
  const id = tag.get('id');
  const type = tag.get('type');
  const data = resources[type];
  if (!data) return {};
  const title = data.getIn([id, 'attributes', 'title_multiloc']);
  return { id, title };
};

class Tags extends React.PureComponent {
  render() {
    const tagsData = this.props.tagsData.toArray();
    const { topics, areas } = this.props;
    return (
      <Card style={{ margin: 0, borderRadius: 0, boxShadow: 'none' }}>
        <Card.Content>
          <Card.Description>
            <Feed.Label />
            <Card.Description style={{ marginBottom: '5px' }}>
              {tagsData.map((tag, i) => {
                const { id, title } = getTagData(tag, { topics, areas });
                if (!title) return null;
                return (
                  <Label key={id} color={colors[i]} style={{ marginBottom: '5px' }}>
                    <T value={title.toJS()} />
                  </Label>
                );
              })}
            </Card.Description>
          </Card.Description>
        </Card.Content>
      </Card>
    );
  }
}



Tags.propTypes = {
  tagsData: PropTypes.object.isRequired,
  topics: PropTypes.any,
  areas: PropTypes.any,
};

const mapStateToProps = createStructuredSelector({
    topics: selectResourcesDomain('topics'),
    areas: selectResourcesDomain('areas')
});

export default connect(mapStateToProps)(Tags);
