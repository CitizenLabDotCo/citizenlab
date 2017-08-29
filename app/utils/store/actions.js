
import { SET_GO_BACK_TO_CODE, DELETE_GO_BACK_TO_CODE } from './constants';

export const setGoBackToCode = (code) => ({ type: SET_GO_BACK_TO_CODE, code });
export const deleteGoBackToCode = (code) => ({ type: DELETE_GO_BACK_TO_CODE, code });
export const goBackTo = (type) => ({ type });
