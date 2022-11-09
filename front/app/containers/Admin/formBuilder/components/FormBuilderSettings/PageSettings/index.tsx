import React from 'react';

// components
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { SectionField } from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

// types
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';

const PageSettings = (field: IFlatCustomFieldWithIndex) => (
  <>
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        id="e2e-title-multiloc"
        name={`customFields.${field.index}.title_multiloc`}
        label={'Title (optional)'}
        type="text"
      />
    </SectionField>
    <SectionField>
      <QuillMultilocWithLocaleSwitcher
        name={`customFields.${field.index}.description_multiloc`}
        label={'Description (optional)'}
      />
    </SectionField>
  </>
);

export default PageSettings;
