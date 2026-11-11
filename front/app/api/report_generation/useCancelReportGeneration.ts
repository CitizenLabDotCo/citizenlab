import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

interface IGenerationCancel {
  data: {
    id: string;
    type: 'generation_cancel';
    attributes: { requested_at: string };
  };
}

// Asks the run in flight — a generation or a chat turn — to stop. The loop reads the
// flag between rounds, so the round under way finishes first; the job tracker and
// the chat, which the panels already poll, show when it has.
const cancelReportGeneration = ({ reportId }: { reportId: string }) =>
  fetcher<IGenerationCancel>({
    path: `/reports/${reportId}/cancel_generation`,
    action: 'post',
    body: {},
  });

const useCancelReportGeneration = () =>
  useMutation<IGenerationCancel, CLErrors, { reportId: string }>({
    mutationFn: cancelReportGeneration,
  });

export default useCancelReportGeneration;
