
import { fromJS } from 'immutable';
import ideasIndexPageReducer from '../reducer';
import {
  generateResourcesAreaValue, generateResourcesIdeaValue, generateResourcesTopicValue,
} from '../../../utils/testing/mocks';
import { loadAreasSuccess, loadIdeasSuccess, loadTopicsSuccess, resetIdeas } from '../actions';

describe('ideasIndexPageReducer', () => {
  const expectedInitialState = {
    nextPageNumber: null,
    nextPageItemCount: null,
    ideas: [],
    loadIdeasError: null,
    loading: false,
    showIdeaWithIndexPage: false,
    topics: {
      ids: [],
      nextPageNumber: null,
      loading: false,
    },
    areas: {
      ids: [],
      nextPageNumber: null,
      loading: false,
    },
  };

  beforeEach(() => {
    // make sure data is clean
    expectedInitialState.ideas = [];
    expectedInitialState.topics.ids = [];
    expectedInitialState.areas.ids = [];
  });

  it('returns the initial state', () => {
    expect(ideasIndexPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });

  describe('LOAD_IDEAS_SUCCESS', () => {
    it('should returns existing ideas (ids) with ideas loaded', () => {
      const initialStateWithIdeas = expectedInitialState;
      let i = 0;

      // comments from resources
      const payload = {
        data: [],
        links: {},
      };

      while (i < 20) {
        if (i < 10) {
          initialStateWithIdeas.ideas.push(i);
        }
        payload.data.push(generateResourcesIdeaValue(i));

        i += 1;
      }

      const nextState = ideasIndexPageReducer(
        fromJS(initialStateWithIdeas), loadIdeasSuccess(payload)
      ).toJS();
      expect(nextState.ideas.length).toEqual(i + 10);
    });
  });

  describe('RESET_IDEAS', () => {
    it('should returns existing ideas, topics and areas as empty arrays', () => {
      const initialStateWithData = expectedInitialState;
      let i = 0;
      while (i < 10) {
        initialStateWithData.ideas.push(i);
        initialStateWithData.topics.ids.push(i);
        initialStateWithData.areas.ids.push(i);
        i += 1;
      }

      const nextState = ideasIndexPageReducer(
        fromJS(initialStateWithData), resetIdeas()
      ).toJS();
      expect(nextState.ideas.length).toEqual(0);
      expect(nextState.topics.ids.length).toEqual(0);
      expect(nextState.areas.ids.length).toEqual(0);
    });
  });

  describe('LOAD_TOPICS_SUCCESS', () => {
    it('should returns loaded topics', () => {
      const initialStateWithIdeas = expectedInitialState;
      let i = 0;

      // comments from resources
      const payload = {
        data: [],
        links: {},
      };

      while (i < 10) {
        payload.data.push(generateResourcesTopicValue(i));

        i += 1;
      }

      const nextState = ideasIndexPageReducer(
        fromJS(initialStateWithIdeas), loadTopicsSuccess(payload)
      ).toJS();
      expect(nextState.topics.ids.length).toEqual(i);
    });
  });

  describe('LOAD_AREAS_SUCCESS', () => {
    it('should returns loaded areas', () => {
      const initialStateWithIdeas = expectedInitialState;
      let i = 0;

      // comments from resources
      const payload = {
        data: [],
        links: {},
      };

      while (i < 10) {
        payload.data.push(generateResourcesAreaValue(i));

        i += 1;
      }

      const nextState = ideasIndexPageReducer(
        fromJS(initialStateWithIdeas), loadAreasSuccess(payload)
      ).toJS();
      expect(nextState.areas.ids.length).toEqual(i);
    });
  });
});
