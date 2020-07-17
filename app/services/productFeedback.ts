import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';
import request from 'utils/request';

const apiEndpoint = `${API_PATH}/product_feedback`;

export interface IProductFeedbackParams {
  question: string;
  answer: string;
  page?: string;
  email?: string | null;
  message?: string;
  locale?: Locale;
}

// todo resp with error types ?
export async function postProductFeedback(params: IProductFeedbackParams) {
  try {
    const response = await request(
      apiEndpoint,
      params,
      { method: 'POST' },
      null
    );
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}
