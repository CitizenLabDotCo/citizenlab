// Libraries
import React, { useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// Components
import { Input, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import { TextCell, Row } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';

// Resources

// Typings
import { Multiloc, Locale } from 'typings';

// Services
import { addPollOption, updatePollOption } from 'services/pollOptions';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import useLocale from 'hooks/useLocale';
import usePrevious from 'hooks/usePrevious';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

/*
 * edit mode : titleMultiloc and optionId defined, question Id not used
 * new mode : question Id defined, titleMultiloc and optionId not used
 */
interface Props {
  titleMultiloc?: Multiloc;
  mode: 'new' | 'edit';
  questionId?: string;
  closeRow: () => void;
  optionId?: string;
}

const OptionFormRow = ({
  optionId,
  titleMultiloc,
  mode,
  questionId,
  closeRow,
}: Props) => {
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);
  const [newTitleMultiloc, setNewTitleMultiloc] = useState<Multiloc>(
    titleMultiloc || {}
  );
  const prevOptionId = usePrevious(optionId);

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  useEffect(() => {
    if (prevOptionId !== optionId) {
      setNewTitleMultiloc(titleMultiloc || {});
    }
  }, [titleMultiloc, optionId, prevOptionId]);

  const onSelectedLocaleChange = (selectedLocale: Locale) => {
    setSelectedLocale(selectedLocale);
  };

  const onChangeTitle = (value: string, locale: string | undefined) => {
    if (locale) {
      setNewTitleMultiloc((currentNewtitleMultiloc) => {
        return {
          ...currentNewtitleMultiloc,
          [locale]: value,
        };
      });
    }
  };

  const onSave = () => {
    if (mode === 'new' && questionId) {
      addPollOption(questionId, newTitleMultiloc).then(() => {
        closeRow();
      });
    }

    if (mode === 'edit' && optionId) {
      updatePollOption(optionId, newTitleMultiloc).then(() => {
        closeRow();
      });
    }
  };

  return (
    <Row className="e2e-form-option-row">
      <TextCell>
        {selectedLocale && (
          <LocaleSwitcher
            onSelectedLocaleChange={onSelectedLocaleChange}
            locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
            selectedLocale={selectedLocale}
            values={{ titleMultiloc: newTitleMultiloc }}
          />
        )}
      </TextCell>

      <TextCell className="expand">
        {selectedLocale && (
          <Input
            autoFocus
            value={newTitleMultiloc[selectedLocale]}
            locale={selectedLocale}
            type="text"
            onChange={onChangeTitle}
          />
        )}
      </TextCell>

      <Button
        className="e2e-form-option-save"
        buttonStyle="secondary"
        onClick={onSave}
      >
        <FormattedMessage {...messages.saveOption} />
      </Button>

      <Button
        className="e2e-form-option-cancel"
        buttonStyle="secondary"
        onClick={closeRow}
      >
        <FormattedMessage {...messages.cancelOption} />
      </Button>
    </Row>
  );
};

export default OptionFormRow;
