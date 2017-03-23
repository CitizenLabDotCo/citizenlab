/*
 *
 * IdeasNewPage actions
 *
 */
import {
  STORE_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_ERROR, LOAD_DRAFT, LOAD_DRAFT_SUCCESS, LOAD_DRAFT_ERROR,
  SAVE_DRAFT, STORE_IDEA_ERROR, STORE_IDEA_SUCCESS, STORE_IDEA, SET_TITLE,
} from './constants';

/*
 *
 * IdeasNewPage actions
 *
 */

export function loadDraft() {
  return {
    type: LOAD_DRAFT,
  };
}

export function draftLoaded(response) {
  return {
    type: (response.content ? LOAD_DRAFT_SUCCESS : LOAD_DRAFT_ERROR),
    content: response.content,
  };
}

export function loadDraftError() {
  return {
    type: LOAD_DRAFT_ERROR,
  };
}

// send draft to backend
export function storeDraft(content) {
  return {
    type: STORE_DRAFT,
    draft: content,
  };
}

export function draftStored(response) {
  return {
    type: (response.success ? STORE_DRAFT_SUCCESS : STORE_DRAFT_ERROR),
  };
}

export function storeDraftError() {
  return {
    type: STORE_DRAFT_ERROR,
  };
}

// store draft in redux store
export function saveDraft(content) {
  return {
    type: SAVE_DRAFT,
    draft: content,
  };
}

export function storeIdea(content) {
  return {
    type: STORE_IDEA,
    idea: content,
  };
}

export function ideaStored() {
  return {
    type: STORE_IDEA_SUCCESS,
  };
}

export function storeIdeaError() {
  return {
    type: STORE_IDEA_ERROR,
  };
}

export function setTitle(title) {
  return {
    type: SET_TITLE,
    title,
  };
}
