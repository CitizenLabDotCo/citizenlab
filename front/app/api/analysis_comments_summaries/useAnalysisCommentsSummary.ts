import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import commentsSummariesKeys from './keys';
import {
  ICommentsSummary,
  SummariesKeys,
  ICommentsSummaryParams,
} from './types';

const fetchCommentsSummary = ({
  analysisId,
  inputId,
}: ICommentsSummaryParams) => {
  return fetcher<ICommentsSummary>({
    path: `/analyses/${analysisId}/inputs/${inputId}/comments_summary`,
    action: 'get',
  });
};

const useAnalysisCommentsSummary = (params: ICommentsSummaryParams) => {
  return useQuery<ICommentsSummary, CLErrors, ICommentsSummary, SummariesKeys>({
    queryKey: commentsSummariesKeys.item({
      analysisId: params.analysisId,
      inputId: params.inputId,
    }),
    queryFn: () => fetchCommentsSummary(params),
  });
};

export default useAnalysisCommentsSummary;
