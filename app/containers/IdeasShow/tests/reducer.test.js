import { fromJS } from 'immutable';
import ideasShowReducer from '../reducer';
import { expectPropertyNotNull } from '../../../utils/testUtils';
import { commentsLoaded, ideaLoadError, loadComments, resetIdeaAndComments } from '../actions';

const generateResourcesCommentValue = (id) => ({
  id,
  attributes: {
    body_multiloc: {
      en: '<p>Voluptatem pariatur corporis ea assumenda qui. Ut accusamus alias delectus nobis autem soluta quo. Nihil tempore aut officiis esse. Cumque eum minima minus.</p><p>Error ut similique est enim non. Velit veniam dolore. Velit minus excepturi ut. Laborum doloribus ab provident iusto voluptatem sint et.</p><p>Odio aut minus aut qui dolorem repellendus. Omnis repellendus quisquam et id. Mollitia dolores et non et possimus.</p>',
      nl: '<p>Voluptas eos sed dicta in in iusto. Quam voluptatem labore illo modi sit vitae. Quia aperiam fugit autem rem. Aliquam non provident dolor necessitatibus hic dolores reiciendis.</p><p>Ratione omnis qui quia provident molestias dolores. Necessitatibus sed quia facilis rerum nam. Aut ratione et id ad rerum enim autem. Doloribus harum soluta voluptatem dicta aliquid amet.</p><p>Dignissimos dicta adipisci exercitationem. Sint fuga minima. Consequatur vero ipsum ex fugiat quas temporibus voluptate.</p>',
    },
    created_at: '2017-04-13T08:14:34.183Z',
    updated_at: '2017-04-14T15:34:41.536Z',
  },
  relationships: {
    idea: {
      data: {
        id: 'c0b352b7-ccc0-4439-a277-78115799adab',
        type: 'ideas',
      },
    },
    author: {
      data: {
        id: '5f5f228f-fc43-4c4d-b5bb-cdab05237185',
        type: 'users',
      },
    },
    parent: {
      data: null,
    },
  },
});

describe('ideasShowReducer', () => {
  const initialState = {
    loadingIdea: false,
    idea: null,
    commentContent: null,
    loadIdeaError: null,
    storeCommentError: null,
    loadCommentsError: null,
    loadingComments: false,
    submittingComment: false,
    comments: [],
    resetEditorContent: false,
    nextCommentPageNumber: null,
    nextCommentPageItemCount: null,
    activeParentId: null,
  };
  const mockString = 'anything';

  it('returns the initial state', () => {
    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(initialState));
  });

  describe('LOAD_IDEA_ERROR', () => {
    it('returns loadIdeaError not null if error is provided', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), ideaLoadError(mockString)
      ).toJS();
      expectPropertyNotNull(nextState, 'loadIdeaError');
    });
  });

  describe('LOAD_COMMENTS_REQUEST', () => {
    it('returns empty comment array if initialLoad is true', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), loadComments(null, null, null, true)
      ).toJS();
      expect(nextState.comments.length).toEqual(0);
    });

    it('returns provided comments if initialLoad is false', () => {
      const initialStateWithComments = initialState;
      let i = 0;
      while (i < 10) {
        initialStateWithComments.comments.push(i);
        i += 1;
      }

      const nextState = ideasShowReducer(
        fromJS(initialStateWithComments), loadComments(null, null, null, false)
      ).toJS();
      expect(nextState.comments.length).toEqual(i);
    });
  });

  describe('LOAD_COMMENTS_SUCCESS', () => {
    it('returns existing comments with new comments', () => {
      const initialStateWithComments = initialState;
      let i = 0;

      // comments from resources
      const payload = {
        data: [],
        links: {},
      };

      while (i < 20) {
        if (i < 10) {
          initialStateWithComments.comments.push(i);
        }
        if (i >= 10) {
          payload.data.push(generateResourcesCommentValue(i));
        }

        i += 1;
      }

      const nextState = ideasShowReducer(
        fromJS(initialStateWithComments), commentsLoaded(payload)
      ).toJS();
      expect(nextState.comments.length).toEqual(i + 10);
    });
  });

  describe('RESET_IDEA_AND_COMMENTS', () => {
    it('returns comments as an empty array, idea null and resetEditorContent false', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), resetIdeaAndComments()
      ).toJS();
      expect(nextState.comments.length).toEqual(0);
      expect(nextState.idea).toBeNull();
      expect(nextState.resetEditorContent).toBeFalsy();
    });
  });
});
