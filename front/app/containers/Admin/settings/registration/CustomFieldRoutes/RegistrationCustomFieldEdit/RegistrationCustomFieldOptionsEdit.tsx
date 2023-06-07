import React from 'react';
import { useParams } from 'react-router-dom';
import clHistory from 'utils/cl-router/history';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useUserCustomFieldOption from 'api/user_custom_fields_options/useUserCustomFieldOption';
import useUpdateUserCustomFieldsOption from 'api/user_custom_fields_options/useUpdateUserCustomFieldsOption';

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

  const { mutate: updateUserCustomFieldOption } =
    useUpdateUserCustomFieldsOption();
  const { data: userCustomFieldOption } = useUserCustomFieldOption({
    customFieldId: userCustomFieldId,
    optionId: userCustomFieldOptionId,
  });

  const handleSubmit = (values: FormValues) => {
    updateUserCustomFieldOption(
      {
        customFieldId: userCustomFieldId,
        optionId: userCustomFieldOptionId,
        title_multiloc: values.title_multiloc,
      },
      {
        onSuccess: () => {
          clHistory.push(
            `/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`
          );
        },
      }
    );
  };

  if (userCustomFieldOption) {
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
            title_multiloc:
              userCustomFieldOption.data.attributes.title_multiloc,
          }}
        />
      </Section>
    );
  }

  return null;
};

export default RegistrationCustomFieldOptionsEdit;
