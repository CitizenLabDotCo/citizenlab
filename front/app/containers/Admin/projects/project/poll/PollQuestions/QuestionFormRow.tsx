import React, { useEffect, useState } from 'react';

import { Input, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import { Multiloc, SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { TextCell, Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

interface Props {
  titleMultiloc: Multiloc;
  onChange: (value: Multiloc) => void;
  onSave: () => void;
  onCancel: () => void;
}

const QuestionFormRow = ({
  onChange,
  titleMultiloc,
  onSave,
  onCancel,
}: Props) => {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    null
  );

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const onChangeLocale = (selectedLocale: SupportedLocale) => {
    setSelectedLocale(selectedLocale);
  };

  const onChangeTitle = (
    value: string,
    locale: SupportedLocale | undefined
  ) => {
    if (locale) {
      const newTitleMultiloc = {
        ...titleMultiloc,
        [locale]: value,
      };

      onChange(newTitleMultiloc);
    }
  };

  return (
    <Row className="e2e-form-question-row" data-testid="question-form-row">
      <TextCell>
        {selectedLocale && (
          <LocaleSwitcher
            onSelectedLocaleChange={onChangeLocale}
            locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
            selectedLocale={selectedLocale}
            values={{ titleMultiloc }}
          />
        )}
      </TextCell>

      <TextCell className="expand">
        {selectedLocale && (
          <Input
            autoFocus
            value={titleMultiloc[selectedLocale]}
            locale={selectedLocale}
            type="text"
            onChange={onChangeTitle}
          />
        )}
      </TextCell>

      <ButtonWithLink
        className="e2e-form-question-save"
        buttonStyle="admin-dark"
        onClick={onSave}
      >
        <FormattedMessage {...messages.saveQuestion} />
      </ButtonWithLink>
      <ButtonWithLink
        className="e2e-form-question-cancel"
        buttonStyle="secondary-outlined"
        onClick={onCancel}
      >
        <FormattedMessage {...messages.cancelFormQuestion} />
      </ButtonWithLink>
    </Row>
  );
};

export default QuestionFormRow;
