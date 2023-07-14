// libraries
import React, { useState, FormEvent } from 'react';

// Services
import useAddSpamReport from 'api/spam_reports/useAddSpamReport';
import { ISpamReportAdd, ReasonCode } from 'api/spam_reports/types';

// Components
import ReportForm from './SpamReportForm';
import { ModalContentContainer } from 'components/UI/Modal';

// Typings
import { CLErrors } from 'typings';

// Utils
import { isCLErrorJSON } from 'utils/errorUtils';

interface Props {
  targetType: 'comments' | 'ideas' | 'initiatives';
  targetId: string;
}

const SpamReportForm = ({ targetType, targetId }: Props) => {
  const [diff, setDiff] = useState<ISpamReportAdd['spam_report'] | null>(null);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [saved, setSaved] = useState(false);
  const { mutate: addSpamReport, isLoading } = useAddSpamReport();

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

    setErrors(null);
  };

  const handleReasonTextUpdate = (other_reason: string) => {
    setDiff(
      diff ? { ...diff, other_reason } : { reason_code: 'other', other_reason }
    );
    setErrors(null);
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
          setSaved(true);
          setErrors(null);
          setDiff(null);
        },
        onError: (e) => {
          if (isCLErrorJSON(e)) {
            setErrors(e.json.errors);
          }
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
        saved={saved}
        errors={errors}
      />
    </ModalContentContainer>
  );
};

export default SpamReportForm;
