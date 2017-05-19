import { linkMock } from 'utils/testing/constants';

import projectsIndexPageReducer, { initialState } from '../reducer';
import { loadProjectsSuccess } from '../actions';

describe('projectsIndexPageReducer', () => {
  describe('LOAD_PROJECTS_SUCCESS', () => {
    it('if links.next available, should set nextPageNumber and nextPageItemCount not null', () => {
      const payload = {
        data: [],
        links: {
          next: linkMock,
        },
      };

      const nextState = projectsIndexPageReducer(initialState, loadProjectsSuccess(payload)).toJS();
      expect(nextState.nextPageNumber).toBeDefined();
      expect(nextState.nextPageItemCount).toBeDefined();
    });
  });
});
