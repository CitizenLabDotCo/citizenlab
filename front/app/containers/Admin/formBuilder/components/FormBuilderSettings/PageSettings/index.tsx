import React from 'react';

// components
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { SectionField } from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

// types
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const PageSettings = (field: IFlatCustomFieldWithIndex) => (
  <>
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        id="e2e-page-title-multiloc"
        name={`customFields.${field.index}.title_multiloc`}
        label={<FormattedMessage {...messages.title} />}
        type="text"
      />
    </SectionField>
    <SectionField>
      <QuillMultilocWithLocaleSwitcher
        name={`customFields.${field.index}.description_multiloc`}
        label={<FormattedMessage {...messages.description} />}
      />
    </SectionField>
  </>
);

export default PageSettings;
