import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

interface FormsyncTestParams {
  locale: string;
  model: string;
  file: string; // base64
}

interface FormsyncTestResponse {
  response: string;
  model: string;
  response_time_ms: number;
}

const formsyncTest = async ({
  locale,
  model,
  file,
}: FormsyncTestParams): Promise<FormsyncTestResponse> => {
  const jwt = getJwt();

  const res = await fetch(`${API_PATH}/importer/formsync_test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ locale, model, file }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error as CLErrors;
  }

  return res.json();
};

const useFormsyncTest = () => {
  return useMutation<FormsyncTestResponse, CLErrors, FormsyncTestParams>({
    mutationFn: formsyncTest,
  });
};

export default useFormsyncTest;
