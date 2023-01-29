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
import { Locale } from 'typings';

type Props = {
  field: IFlatCustomFieldWithIndex;
  locale: Locale;
};

const PageSettings = ({ field, locale }: Props) => {
  return (
    <>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          initiallySelectedLocale={locale}
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
