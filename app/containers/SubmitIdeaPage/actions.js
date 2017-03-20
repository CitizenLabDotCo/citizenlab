/*
 *
 * SubmitIdeaPage actions
 *
 */
import { STORE_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_ERROR, LOAD_DRAFT, LOAD_DRAFT_SUCCESS, LOAD_DRAFT_ERROR,
  SAVE_DRAFT,
} from './constants';

// none yet

/*
 *
 * SubmitIdeaEditor actions
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
