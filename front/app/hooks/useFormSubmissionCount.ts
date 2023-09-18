import { useState, useEffect } from 'react';
import {
  formSubmissionCountStream,
  IFormSubmissionCountData,
} from 'services/formCustomFields';

interface Props {
  projectId: string;
  phaseId?: string | null;
}

export default function useFormSubmissionCount({ projectId, phaseId }: Props) {
  const [submissionCount, setSubmissionCount] = useState<
    IFormSubmissionCountData | undefined | null | Error
  >(undefined);
  useEffect(() => {
    const subscription = formSubmissionCountStream(
      projectId,
      phaseId
    ).observable.subscribe((submissionCount) => {
      setSubmissionCount(submissionCount.data.attributes);
    });

    return () => subscription.unsubscribe();
  }, [projectId, phaseId]);

  return submissionCount;
}
