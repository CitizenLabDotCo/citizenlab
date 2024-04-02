import React from 'react';

import get from 'lodash-es/get';
import { SupportedLocale } from 'typings';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
  locale: SupportedLocale;
};

const FieldGroupSettings = ({ field, locale }: Props) => {
  const lockedAttributes = field?.constraints?.locks;
  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <>
      {!get(lockedAttributes, 'title_multiloc', false) && (
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            initiallySelectedLocale={locale}
            id="e2e-field-group-title-multiloc"
            name={`customFields.${field.index}.title_multiloc`}
            label={<FormattedMessage {...messages.titleLabel} />}
            onKeyDown={handleKeyDown}
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
