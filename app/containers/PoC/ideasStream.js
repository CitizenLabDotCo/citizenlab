import { API_PATH } from 'containers/App/constants';
import Streams from './streams';

class IdeasStream {
  constructor() {
    this.stream = null;
  }

  observe(queryParameters = null) {
    const url = `${API_PATH}/ideas`;
    const onIdeaAdded = (ideas, addedIdea) => ({ ...addedIdea, selected: false });
    this.stream = Streams.arrayStream(url, onIdeaAdded, queryParameters);
    return this.stream.observable;
  }

  select(ideaID) {
    this.stream.observer.next((ideas) => {
      return ideas.map((idea) => {
        if (idea.id === ideaID && !idea.selected) {
          return {
            ...idea,
            selected: true,
          };
        }

        if (idea.id !== ideaID && idea.selected) {
          return {
            ...idea,
            selected: false,
          };
        }

        return idea;
      });
    });
  }
}

export default new IdeasStream();
