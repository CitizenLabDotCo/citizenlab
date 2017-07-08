import { API_PATH } from 'containers/App/constants';
import Streams from '../utils/streams';
import Rx from 'rxjs/Rx';
import _ from 'lodash';

class IdeaService {
  observe(id, localProperties = false) {
    return Streams.create(`${API_PATH}/ideas/${id}`, null, localProperties);
  }

  observeRelationShips(idea) {
    const { relationships } = idea;

    const topicIds = _(relationships.topics.data).map((topic) => topic.id).value();
    const areaIds = _(relationships.areas.data).map((area) => area.id).value();
    const imageIds = _(relationships.idea_images.data).map((ideaImage) => ideaImage.id).value();
    const authorId = (relationships.author.data ? relationships.author.data.id : null);
    const projectId = (relationships.author.data ? relationships.project.data.id : null);

    const topicsStreams = (topicIds.length > 0 ? Rx.Observable.combineLatest(
      topicIds.map((topicId) => Streams.create(`${API_PATH}/topics/${topicId}`).observable),
      (...args) => _.flatten(args)
    ) : Rx.Observable.of(null));

    const areasStreams = (areaIds.length > 0 ? Rx.Observable.combineLatest(
      areaIds.map((areaId) => Streams.create(`${API_PATH}/areas/${areaId}`).observable),
      (...args) => _.flatten(args)
    ) : Rx.Observable.of(null));

    const imagesStreams = (imageIds.length > 0 ? Rx.Observable.combineLatest(
      imageIds.map((imageId) => Streams.create(`${API_PATH}/ideas/${idea.id}/images/${imageId}`).observable),
      (...args) => _.flatten(args)
    ) : Rx.Observable.of(null));

    const authorStream = (authorId ? Streams.create(`${API_PATH}/users/${authorId}`).observable : Rx.Observable.of(null));

    const projectStream = (projectId ? Streams.create(`${API_PATH}/projects/${projectId}`).observable : Rx.Observable.of(null));

    return Rx.Observable.combineLatest(
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
    );
  }
}

export default new IdeaService();
