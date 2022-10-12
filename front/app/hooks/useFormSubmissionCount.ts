import { useState, useEffect } from 'react';
import {
  formSubmissionCountStream,
  IFormSubmissionCountData,
} from 'services/formSubmissionCount';
import { ProcessType } from 'services/projects';

interface Props {
  projectId: string;
  projectType: ProcessType | undefined;
  phaseId?: string | null;
}

export default function useFormSubmissionCount({
  projectId,
  projectType,
  phaseId,
}: Props) {
  const [submissionCount, setSubmissionCount] = useState<
    IFormSubmissionCountData | undefined | null | Error
  >(undefined);
  useEffect(() => {
    const subscription = formSubmissionCountStream(
      projectId,
      projectType,
      phaseId
    ).observable.subscribe((submissionCount) => {
      setSubmissionCount(submissionCount.data);
    });

    return () => subscription.unsubscribe();
  }, [projectId, phaseId, projectType]);

  return submissionCount;
}
