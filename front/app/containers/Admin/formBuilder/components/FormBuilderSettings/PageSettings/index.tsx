import React from 'react';
// types
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';
// intl
import { FormattedMessage } from 'utils/cl-intl';
// components
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { SectionField } from 'components/admin/Section';
import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
};

const PageSettings = ({ field }: Props) => {
  return (
    <>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          id="e2e-page-title-multiloc"
          name={`customFields.${field.index}.title_multiloc`}
          label={<FormattedMessage {...messages.titleLabel} />}
          type="text"
        />
      </SectionField>
      <SectionField data-cy="e2e-page-description-multiloc">
        <QuillMultilocWithLocaleSwitcher
          name={`customFields.${field.index}.description_multiloc`}
          label={<FormattedMessage {...messages.descriptionLabel} />}
        />
      </SectionField>
    </>
  );
};

export default PageSettings;
