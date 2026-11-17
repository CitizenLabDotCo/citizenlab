import React, { useEffect, useState } from 'react';

import {
  Input,
  LocaleSwitcher as PageLocaleSwitcher,
} from '@citizenlab/cl2-component-library';
import { Multiloc, SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import LocaleSwitcher from 'components/admin/MultilocFields/LocaleSwitcher';
import { TextCell, Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import Button from 'design-system/Button';
import TextField from 'design-system/TextField';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import { useIsPanelPoll } from '../PollVariantContext';

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
  const isPanel = useIsPanelPoll();
  const { formatMessage } = useIntl();

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
        {selectedLocale &&
          (isPanel ? (
            <LocaleSwitcher
              aria-label={formatMessage(messages.questionTitleLabel)}
              locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
              selectedLocale={selectedLocale}
              onChange={onChangeLocale}
              valueMultiloc={titleMultiloc}
            />
          ) : (
            <PageLocaleSwitcher
              onSelectedLocaleChange={onChangeLocale}
              locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
              selectedLocale={selectedLocale}
              values={{ titleMultiloc }}
            />
          ))}
      </TextCell>

      <TextCell className="expand">
        {selectedLocale &&
          (isPanel ? (
            <TextField
              aria-label={formatMessage(messages.questionTitleLabel)}
              autoFocus
              size={32}
              value={titleMultiloc[selectedLocale] ?? ''}
              onChange={(value) => onChangeTitle(value, selectedLocale)}
            />
          ) : (
            <Input
              autoFocus
              value={titleMultiloc[selectedLocale]}
              locale={selectedLocale}
              type="text"
              onChange={onChangeTitle}
            />
          ))}
      </TextCell>

      {isPanel ? (
        <>
          <Button variant="primary" size={28} onPress={onSave}>
            <FormattedMessage {...messages.saveQuestion} />
          </Button>
          <Button size={28} onPress={onCancel}>
            <FormattedMessage {...messages.cancelFormQuestion} />
          </Button>
        </>
      ) : (
        <>
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
        </>
      )}
    </Row>
  );
};

export default QuestionFormRow;
