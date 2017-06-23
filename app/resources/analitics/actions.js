
import { CREATE_ANALITICS_EVENT_REQUEST, CREATE_ANALITICS_EVENT_SUCCESS } from './constants';

export const createAnaliticsEventRequest = (payload) => ({
  type: CREATE_ANALITICS_EVENT_REQUEST,
  payload,
});

export const createAnaliticsEventSuccess = () => ({
  type: CREATE_ANALITICS_EVENT_SUCCESS,
});
