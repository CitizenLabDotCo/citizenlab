import React from 'react';

import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import UserFieldsInSurveyToggle from 'components/admin/UserFieldsInSurveyToggle/UserFieldsInSurveyToggle';

type Props = {
  phaseId: string;
};

const UserFieldsToggle = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { mutate: updatePhase } = useUpdatePhase();

  const userFieldsInForm = phase?.data.attributes.user_fields_in_form;

  const handleToggleChange = () => {
    phaseId &&
      updatePhase({
        phaseId,
        user_fields_in_form: !userFieldsInForm,
      });
  };

  return (
    <UserFieldsInSurveyToggle
      userFieldsInForm={phase?.data.attributes.user_fields_in_form}
      handleUserFieldsInFormOnChange={handleToggleChange}
      enabledByDefault={true}
    />
  );
};

export default UserFieldsToggle;
