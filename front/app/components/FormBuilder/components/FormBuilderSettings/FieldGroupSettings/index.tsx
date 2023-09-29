import React from 'react';

// components
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { SectionField } from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

// types
import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { Locale } from 'typings';
import get from 'lodash-es/get';

type Props = {
  field: IFlatCustomFieldWithIndex;
  locale: Locale;
};

const FieldGroupSettings = ({ field, locale }: Props) => {
  const lockedAttributes = field?.constraints?.locks;

  return (
    <>
      {!get(lockedAttributes, 'title_multiloc', false) && (
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            initiallySelectedLocale={locale}
            id="e2e-field-group-title-multiloc"
            name={`customFields.${field.index}.title_multiloc`}
            label={<FormattedMessage {...messages.titleLabel} />}
          />
        </SectionField>
      )}
      <SectionField data-cy="e2e-field-group-description-multiloc">
        <QuillMultilocWithLocaleSwitcher
          name={`customFields.${field.index}.description_multiloc`}
          label={<FormattedMessage {...messages.descriptionLabel} />}
        />
      </SectionField>
    </>
  );
};

export default FieldGroupSettings;
