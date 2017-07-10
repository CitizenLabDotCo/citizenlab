import { API_PATH } from 'containers/App/constants';
import Streams from '../utils/streams';

class IdeasService {
  observe(queryParameters = null, localProperties = false) {
    return Streams.create(`${API_PATH}/ideas`, queryParameters, localProperties);
  }

  toggleIdea(observers, ideaID) {
    const action = (ideas) => ideas.map((idea) => {
      if (idea.id === ideaID) {
        return {
          ...idea,
          selected: !idea.selected,
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

    observers.forEach((observer) => observer.next(action));
  }
}

export default new IdeasService();
