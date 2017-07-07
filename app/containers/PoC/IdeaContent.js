import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Rx from 'rxjs/Rx';
import _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import Stream from './stream';

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
    const { idea } = this.props;
    const { relationships } = idea;

    const topicIds = _(relationships.topics.data).map((topic) => topic.id).value();
    const areaIds = _(relationships.areas.data).map((area) => area.id).value();
    const imageIds = _(relationships.idea_images.data).map((ideaImage) => ideaImage.id).value();
    const authorId = (relationships.author.data ? relationships.author.data.id : null);
    const projectId = (relationships.author.data ? relationships.project.data.id : null);

    const topicsStreams = (topicIds.length > 0 ? Rx.Observable.combineLatest(
      topicIds.map((topicId) => Stream.create(`${API_PATH}/topics/${topicId}`).observable),
      (...args) => _.flatten(args)
    ) : Rx.Observable.of(null));

    const areasStreams = (areaIds.length > 0 ? Rx.Observable.combineLatest(
      areaIds.map((areaId) => Stream.create(`${API_PATH}/areas/${areaId}`).observable),
      (...args) => _.flatten(args)
    ) : Rx.Observable.of(null));

    const imagesStreams = (imageIds.length > 0 ? Rx.Observable.combineLatest(
      imageIds.map((imageId) => Stream.create(`${API_PATH}/ideas/${idea.id}/images/${imageId}`).observable),
      (...args) => _.flatten(args)
    ) : Rx.Observable.of(null));

    const authorStream = (authorId ? Stream.create(`${API_PATH}/users/${authorId}`).observable : Rx.Observable.of(null));

    const projectStream = (projectId ? Stream.create(`${API_PATH}/projects/${projectId}`).observable : Rx.Observable.of(null));

    this.subscriptions = [
      Rx.Observable.combineLatest(
        topicsStreams,
        areasStreams,
        imagesStreams,
        authorStream,
        projectStream,
        (s1, s2, s3, s4, s5) => {
          return {
            topics: s1,
            areas: s2,
            images: s3,
            author: s4,
            project: s5,
          };
        }
      ).subscribe((data) => {
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
    console.log(`Rendered IdeaConent ${idea.id}`);

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
