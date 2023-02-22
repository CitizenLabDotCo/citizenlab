// libraries
import React, { useState, FormEvent } from 'react';

// Services
import { sendSpamReport, Report } from 'services/spamReports';

// Components
import ReportForm from './SpamReportForm';
import { ModalContentContainer } from 'components/UI/Modal';

// Typings
import { CLErrors } from 'typings';

// Utils
import { isCLErrorJSON } from 'utils/errorUtils';

interface Props {
  resourceType: 'comments' | 'ideas' | 'initiatives';
  resourceId: string;
}

const SpamReportForm = ({ resourceType, resourceId }: Props) => {
  const [diff, setDiff] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSelectionChange = (reason_code: Report['reason_code']) => {
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

    setLoading(true);

    sendSpamReport(resourceType, resourceId, diff)
      .then(() => {
        setLoading(false);
        setSaved(true);
        setErrors(null);
        setDiff(null);
      })
      .catch((e) => {
        setLoading(false);
        if (isCLErrorJSON(e)) {
          setErrors(e.json.errors);
        }
      });
  };

  return (
    <ModalContentContainer>
      <ReportForm
        reasonCodes={['wrong_content', 'inappropriate', 'other']}
        diff={diff}
        onReasonChange={handleSelectionChange}
        onTextChange={handleReasonTextUpdate}
        onSubmit={handleSubmit}
        loading={loading}
        saved={saved}
        errors={errors}
      />
    </ModalContentContainer>
  );
};

export default SpamReportForm;
