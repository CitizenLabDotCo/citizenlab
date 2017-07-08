import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import IdeaService from '../services/ideaService';

const Container = styled.div`
  width: 100%;
  background: #f0f0f0;
  padding: 10px 25px;
`;

const ListItem = styled.div`
  color: #333;;
  font-size: 16px;
  padding: 10px 0px;
`;

class IdeaContent extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.state = {
      loading: true,
      topics: null,
      areas: null,
      images: null,
      author: null,
      project: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      IdeaService.observeRelationShips(this.props.idea).subscribe((data) => {
        const { topics, areas, images, author, project } = data;
        this.setState({ loading: false, topics, areas, images, author, project });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { idea } = this.props;
    const { loading, topics, areas, images, author, project } = this.state;

    console.log(`Rendered IdeaConent for idea ${idea.id}`);

    return (
      <Container>
        { loading && <ListItem>Loading...</ListItem> }
        { !loading &&
          <div>
            <ListItem>{idea.attributes.body_multiloc.en}</ListItem>
            <ListItem>Topics: { topics ? topics.map((topic) => `${topic.attributes.title_multiloc.en}, `) : 'none' }</ListItem>
            <ListItem>Areas: { areas ? areas.map((area) => `${area.attributes.title_multiloc.en}, `) : 'none' }</ListItem>
            <ListItem>Images: { images ? images.map((image) => `${image.id}, `) : 'none' }</ListItem>
            <ListItem>Author: { author ? `${author.attributes.first_name} ${author.attributes.last_name}` : 'none' }</ListItem>
            <ListItem>Project: { project ? project.attributes.title_multiloc.en : 'none' }</ListItem>
          </div>
        }
      </Container>
    );
  }
}

IdeaContent.propTypes = {
  idea: PropTypes.object.isRequired,
};

export default IdeaContent;
