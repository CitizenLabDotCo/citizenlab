// libraries
import React, { useState, FormEvent } from 'react';

// Services
import useAddSpamReport from 'api/spam_reports/useAddSpamReport';
import { ISpamReportAdd, ReasonCode } from 'api/spam_reports/types';

// Components
import ReportForm from './SpamReportForm';
import { ModalContentContainer } from 'components/UI/Modal';

interface Props {
  targetType: 'comments' | 'ideas' | 'initiatives';
  targetId: string;
}

const SpamReportForm = ({ targetType, targetId }: Props) => {
  const [diff, setDiff] = useState<ISpamReportAdd['spam_report'] | null>(null);

  const {
    mutate: addSpamReport,
    isLoading,
    isSuccess,
    error,
    reset,
  } = useAddSpamReport();

  const handleSelectionChange = (reason_code: ReasonCode) => {
    // Clear the "other reason" text when it's not necessary

    setDiff((diff) => {
      if (diff && reason_code !== 'other') {
        delete diff.other_reason;
      }

      return {
        ...diff,
        reason_code,
      };
    });

    reset();
  };

  const handleReasonTextUpdate = (other_reason: string) => {
    setDiff(
      diff ? { ...diff, other_reason } : { reason_code: 'other', other_reason }
    );
    reset();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!diff) {
      return;
    }

    addSpamReport(
      { targetId, targetType, spam_report: diff },
      {
        onSuccess: () => {
          setDiff(null);
        },
      }
    );
  };

  return (
    <ModalContentContainer>
      <ReportForm
        reasonCodes={['wrong_content', 'inappropriate', 'other']}
        diff={diff}
        onReasonChange={handleSelectionChange}
        onTextChange={handleReasonTextUpdate}
        onSubmit={handleSubmit}
        loading={isLoading}
        saved={isSuccess}
        errors={error?.errors || null}
      />
    </ModalContentContainer>
  );
};

export default SpamReportForm;
