import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useUserCustomFieldOption from 'hooks/useUserCustomFieldOption';

// services
import { updateUserCustomFieldOption } from 'services/userCustomFieldOptions';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import RegistrationCustomFieldOptionsForm, {
  FormValues,
} from './RegistrationCustomFieldOptionsForm';

const RegistrationCustomFieldOptionsEdit = () => {
  const { userCustomFieldId, userCustomFieldOptionId } = useParams() as {
    userCustomFieldId: string;
    userCustomFieldOptionId: string;
  };

  const userCustomFieldOption = useUserCustomFieldOption(
    userCustomFieldId,
    userCustomFieldOptionId
  );

  const handleSubmit = async (values: FormValues) => {
    await updateUserCustomFieldOption(
      userCustomFieldId,
      userCustomFieldOptionId,
      {
        title_multiloc: values.title_multiloc,
      }
    );

    clHistory.push(
      `/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`
    );
  };

  if (!isNilOrError(userCustomFieldOption)) {
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage
            {...messages.editCustomFieldAnswerOptionFormTitle}
          />
        </SectionTitle>
        <RegistrationCustomFieldOptionsForm
          onSubmit={handleSubmit}
          defaultValues={{
            title_multiloc: userCustomFieldOption.attributes.title_multiloc,
          }}
        />
      </Section>
    );
  }

  return null;
};

export default RegistrationCustomFieldOptionsEdit;
