import React from 'react';

import useLocalize from 'hooks/useLocalize';

import RadioGroup from 'components/HookForm/RadioGroup';
import Radio from 'components/HookForm/RadioGroup/Radio';
import Select from 'components/HookForm/Select';

import { extractOptions } from '../util';

const SingleSelectField = ({ question }) => {
  const localize = useLocalize();
  return question.dropdown_layout ? (
    <Select
      name={question.key}
      options={extractOptions(
        question,
        localize,
        question.random_option_ordering
      )}
    />
  ) : (
    <RadioGroup name={question.key}>
      {extractOptions(question, localize, question.random_option_ordering).map(
        (option) => (
          <Radio
            name={question.key}
            id={option.value}
            key={option.value}
            value={option.value}
            label={option.label}
          />
        )
      )}
    </RadioGroup>
  );
};

export default SingleSelectField;
