import React, { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Components
import { Input, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import { TextCell, Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
import { Multiloc, Locale } from 'typings';

// Hooks
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

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
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const onChangeLocale = (selectedLocale: Locale) => {
    setSelectedLocale(selectedLocale);
  };

  const onChangeTitle = (value: string, locale: Locale | undefined) => {
    if (locale) {
      const newTitleMultiloc = {
        ...titleMultiloc,
        [locale]: value,
      };

      onChange(newTitleMultiloc);
    }
  };

  return (
    <Row className="e2e-form-question-row">
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

      <Button
        className="e2e-form-question-save"
        buttonStyle="primary"
        onClick={onSave}
      >
        <FormattedMessage {...messages.saveQuestion} />
      </Button>
      <Button
        className="e2e-form-question-cancel"
        buttonStyle="secondary"
        onClick={onCancel}
      >
        <FormattedMessage {...messages.cancelFormQuestion} />
      </Button>
    </Row>
  );
};

export default QuestionFormRow;
