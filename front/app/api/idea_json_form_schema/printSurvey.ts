import fetcher from 'utils/cl-react-query/fetcher';

interface Params {
  projectId: string;
}

export const printSurvey = ({ projectId }: Params) => {
  return fetcher({
    path: `/projects/${projectId}/custom_fields/to_pdf`,
    action: 'get',
  });
};
