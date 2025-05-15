import React from 'react';

import { useFormContext } from 'react-hook-form';

import useLocalize from 'hooks/useLocalize';

import CheckboxMultiSelect from 'components/HookForm/CheckboxMultiSelect';
import Input from 'components/HookForm/Input';
import MultipleSelect from 'components/HookForm/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { extractOptions } from '../util';

const MultiSelectField = ({ question }) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();

  const value = watch(question.key);

  return (
    <>
      {question.dropdown_layout ? (
        <MultipleSelect
          name={question.key}
          options={extractOptions(question, localize)}
        />
      ) : (
        <CheckboxMultiSelect
          name={question.key}
          options={extractOptions(question, localize)}
        />
      )}
      {value?.includes('other') && (
        <Input
          name={`${question.key}_other`}
          type="text"
          placeholder={formatMessage(messages.typeYourAnswer)}
        />
      )}
    </>
  );
};

export default MultiSelectField;
