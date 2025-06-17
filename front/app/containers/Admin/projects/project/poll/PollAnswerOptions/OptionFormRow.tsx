import React, { useEffect, useState } from 'react';

import { Input, LocaleSwitcher } from '@citizenlab/cl2-component-library';
import { Multiloc, SupportedLocale } from 'typings';

import useAddPollOption from 'api/poll_options/useAddPollOption';
import useUpdatePollOption from 'api/poll_options/useUpdatePollOption';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';
import usePrevious from 'hooks/usePrevious';

import { TextCell, Row } from 'components/admin/ResourceList';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

/*
 * edit mode : titleMultiloc and optionId defined, question Id not used
 * new mode : question Id defined, titleMultiloc and optionId not used
 */
interface Props {
  titleMultiloc?: Multiloc;
  mode: 'new' | 'edit';
  questionId: string;
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
  const { mutate: addPollOption } = useAddPollOption();
  const { mutate: updatePollOption } = useUpdatePollOption();
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    null
  );
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

  const onSelectedLocaleChange = (selectedLocale: SupportedLocale) => {
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
      addPollOption(
        { questionId, title_multiloc: newTitleMultiloc },
        {
          onSuccess: () => closeRow(),
        }
      );
    }

    if (mode === 'edit' && optionId) {
      updatePollOption(
        { optionId, title_multiloc: newTitleMultiloc, questionId },
        {
          onSuccess: () => closeRow(),
        }
      );
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

      <ButtonWithLink
        className="e2e-form-option-save"
        buttonStyle="admin-dark"
        onClick={onSave}
      >
        <FormattedMessage {...messages.saveOption} />
      </ButtonWithLink>

      <ButtonWithLink
        className="e2e-form-option-cancel"
        buttonStyle="secondary-outlined"
        onClick={closeRow}
      >
        <FormattedMessage {...messages.cancelOption} />
      </ButtonWithLink>
    </Row>
  );
};

export default OptionFormRow;
