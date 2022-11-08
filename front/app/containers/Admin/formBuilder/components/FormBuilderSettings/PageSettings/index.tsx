import React from 'react';

// components
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';

const PageSettings = (field: any) => {
  return (
    <>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          id="e2e-title-multiloc"
          name={`customFields.${field.index}.title_multiloc`}
          label="Title"
          type="text"
        />
      </SectionField>
    </>
  );
};

export default PageSettings;
