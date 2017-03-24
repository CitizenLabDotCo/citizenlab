/*
 *
 * IdeasNewPage actions
 *
 */
import {
  STORE_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_ERROR, LOAD_DRAFT, LOAD_DRAFT_SUCCESS, LOAD_DRAFT_ERROR,
  SAVE_DRAFT, STORE_IDEA_ERROR, STORE_IDEA_SUCCESS, STORE_IDEA, SET_TITLE, LOAD_ATTACHMENTS, LOAD_ATTACHMENTS_SUCCESS,
  LOAD_ATTACHMENTS_ERROR, STORE_ATTACHMENT, STORE_ATTACHMENT_SUCCESS, STORE_ATTACHMENT_ERROR,
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

export function loadAttachments() {
  return {
    type: LOAD_ATTACHMENTS,
  };
}

export function attachmentsLoaded(response) {
  return {
    type: (response.content ? LOAD_ATTACHMENTS_SUCCESS : LOAD_ATTACHMENTS_ERROR),
    attachments: response.attachments,
  };
}

export function loadAttachmentsError() {
  return {
    type: LOAD_ATTACHMENTS_ERROR,
  };
}

export function storeAttachment() {
  return {
    type: STORE_ATTACHMENT,
  };
}

export function attachmentStored(response) {
  return {
    type: (response.content ? STORE_ATTACHMENT_SUCCESS : STORE_ATTACHMENT_ERROR),
    source: response.source,
  };
}

export function storeAttachmentError() {
  return {
    type: STORE_ATTACHMENT_ERROR,
  };
}
