import { API_PATH } from 'containers/App/constants';
import Streams from './streams';

class IdeasObserver {
  constructor() {
    this.stream = null;
  }

  observe() {
    const onChildAdded = (list, newItem) => ({ ...newItem, selected: false });
    this.stream = Streams.arrayStream(`${API_PATH}/ideas`, onChildAdded);
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

export default new IdeasObserver();
