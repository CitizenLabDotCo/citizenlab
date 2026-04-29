import React from 'react';

import useCustomFieldOption from 'api/custom_field_options/useCustomFieldOption';
import useUpdateCustomFieldOption from 'api/custom_field_options/useUpdateCustomFieldOption';

import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../messages';

import RegistrationCustomFieldOptionsForm, {
  FormValues,
} from './RegistrationCustomFieldOptionsForm';

const RegistrationCustomFieldOptionsEdit = () => {
  const { userCustomFieldId, userCustomFieldOptionId } = useParams({
    strict: false,
  }) as {
    userCustomFieldId: string;
    userCustomFieldOptionId: string;
  };

  const { mutateAsync: updateCustomFieldOption } = useUpdateCustomFieldOption();
  const { data: userCustomFieldOption } = useCustomFieldOption({
    optionId: userCustomFieldOptionId,
  });

  const handleSubmit = async (values: FormValues) => {
    await updateCustomFieldOption({
      optionId: userCustomFieldOptionId,
      title_multiloc: values.title_multiloc,
    });
    clHistory.push(
      `/admin/settings/registration/custom-fields/${userCustomFieldId}/options/`
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
