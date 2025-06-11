import React, { useMemo } from 'react';

import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import Input from 'components/HookForm/Input';
import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';
import Select from 'components/HookForm/Select';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { extractOptions } from '../util';

const SingleSelectField = ({
  question,
  scrollErrorIntoView,
}: {
  question: IFlatCustomField;
  scrollErrorIntoView?: boolean;
}) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { watch } = useFormContext();

  const value = watch(question.key);

  const options = useMemo(() => {
    return extractOptions(question, localize, question.random_option_ordering);
  }, [question, localize]);

  return (
    <>
      {question.dropdown_layout ? (
        <Select
          name={question.key}
          options={options}
          scrollErrorIntoView={scrollErrorIntoView}
        />
      ) : (
        <RadioGroup name={question.key}>
          {options.map((option) => (
            <Radio
              name={question.key}
              id={option.value}
              key={option.value}
              value={option.value}
              label={option.label}
            />
          ))}
        </RadioGroup>
      )}
      {value === 'other' && (
        <Input
          name={`${question.key}_other`}
          type="text"
          placeholder={formatMessage(messages.typeYourAnswer)}
        />
      )}
    </>
  );
};

export default SingleSelectField;
