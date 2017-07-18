import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { observeIdeaRelationShips } from '../services/ideaService';

const Container = styled.div`
  width: 100%;
  padding: 0px 0px;
  background: #fff;
  padding: 0px 20px;
  padding-bottom: 20px;
  display: ${(props) => props.selected ? 'block' : 'none'};
`;

const ListItem = styled.div`
  color: #333;;
  font-size: 15px;
  font-weight: 300;
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
      observeIdeaRelationShips(this.props.idea).subscribe((data) => {
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

    // console.log(`Rendered IdeaConent for idea ${idea.id}`);

    return (
      <Container selected={idea.selected}>
        { loading && <ListItem>Loading...</ListItem> }
        { !loading &&
          <div>
            <ListItem dangerouslySetInnerHTML={{ __html: idea.attributes.body_multiloc.en }} />
            <ListItem><strong>Topics:</strong> { topics ? topics.map((topic) => `${topic.attributes.title_multiloc.en}, `) : 'none' }</ListItem>
            <ListItem><strong>Areas:</strong> { areas ? areas.map((area) => `${area.attributes.title_multiloc.en}, `) : 'none' }</ListItem>
            <ListItem><strong>Images:</strong> { images ? images.map((image) => `${image.id}, `) : 'none' }</ListItem>
            <ListItem><strong>Author:</strong> { author ? `${author.attributes.first_name} ${author.attributes.last_name}` : 'none' }</ListItem>
            <ListItem><strong>Project:</strong> { project ? project.attributes.title_multiloc.en : 'none' }</ListItem>
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
