import React from 'react';
import clHistory from 'utils/cl-router/history';

// Services

// Components
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import CauseForm, { SubmitValues } from './CauseForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { useParams } from 'react-router-dom';
import useAddCause from 'api/causes/useAddCause';

const NewCause = () => {
  const { projectId, phaseId } = useParams();
  const { mutateAsync: addCause } = useAddCause();

  const participationContextType = phaseId ? 'phase' : 'project';
  const participationContextId =
    participationContextType === 'phase' ? phaseId : projectId;
  const handleOnSubmit = async (formValues: SubmitValues) => {
    const { title_multiloc, description_multiloc, image } = formValues;
    if (title_multiloc && description_multiloc && participationContextId) {
      let PCType: 'Project' | 'Phase';
      switch (participationContextType) {
        case 'project':
          PCType = 'Project';
          break;
        case 'phase':
          PCType = 'Phase';
          break;
      }
      await addCause(
        {
          description_multiloc,
          title_multiloc,
          participation_context_type: PCType,
          participation_context_id: participationContextId,
          image,
        },
        {
          onSuccess: () => {
            clHistory.push(`/admin/projects/${projectId}/volunteering`);
          },
        }
      );
    }
  };

  return (
    <div>
      <SectionTitle>
        <FormattedMessage {...messages.newCauseTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.newCauseSubtitle} />
      </SectionDescription>

      <CauseForm onSubmit={handleOnSubmit} />
    </div>
  );
};

export default NewCause;
