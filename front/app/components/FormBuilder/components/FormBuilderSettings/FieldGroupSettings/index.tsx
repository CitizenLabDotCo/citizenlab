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
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  field: IFlatCustomFieldWithIndex;
  locale: Locale;
};

const FieldGroupSettings = ({ field, locale }: Props) => {
  const lockedAttributes = field?.constraints?.locks;

  return (
    <>
      {!isNilOrError(lockedAttributes)
        ? !lockedAttributes.title_multiloc
        : true && (
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                initiallySelectedLocale={locale}
                id="e2e-field-group-title-multiloc"
                name={`customFields.${field.index}.title_multiloc`}
                label={<FormattedMessage {...messages.titleLabel} />}
                type="text"
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
