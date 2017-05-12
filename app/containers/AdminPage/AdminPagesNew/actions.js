/*
 *
 * AdminPagesNew actions
 *
 */

import {
  INVALID_FORM_ERROR, PUBLISH_PAGE_ERROR, PUBLISH_PAGE_REQUEST, PUBLISH_PAGE_SUCCESS, SET_TITLE,
} from './constants';

export function publishPageRequest(contents, titles) {
  return (contents
      ? {
        type: PUBLISH_PAGE_REQUEST,
        payload: contents,
        titles,
      }
      : {
        type: PUBLISH_PAGE_ERROR,
      }
  );
}

export function publishPageSuccess() {
  return {
    type: PUBLISH_PAGE_SUCCESS,
  };
}

export function publishPageError(error) {
  return {
    type: PUBLISH_PAGE_ERROR,
    error,
  };
}

export function setFormError() {
  return {
    type: INVALID_FORM_ERROR,
  };
}

export function setTitle(titleMultiloc) {
  return {
    type: SET_TITLE,
    payload: titleMultiloc,
  };
}
