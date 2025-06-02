import React, { useMemo } from 'react';

import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import CheckboxMultiSelect from 'components/HookForm/CheckboxMultiSelect';
import Input from 'components/HookForm/Input';
import MultipleSelect from 'components/HookForm/MultipleSelect';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { extractOptions } from '../util';

const MultiSelectField = ({
  question,
  scrollErrorIntoView,
}: {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
}) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();

  const value = watch(question.key);

  const options = useMemo(() => {
    return extractOptions(question, localize, question.random_option_ordering);
  }, [question, localize]);

  return (
    <>
      {question.dropdown_layout ? (
        <MultipleSelect
          name={question.key}
          options={options}
          scrollErrorIntoView={scrollErrorIntoView}
        />
      ) : (
        <CheckboxMultiSelect
          name={question.key}
          options={options}
          scrollErrorIntoView={scrollErrorIntoView}
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
