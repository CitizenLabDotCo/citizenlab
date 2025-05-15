import React from 'react';

import useLocalize from 'hooks/useLocalize';

import CheckboxMultiSelect from 'components/HookForm/CheckboxMultiSelect';
import MultipleSelect from 'components/HookForm/MultipleSelect';

import { extractOptions } from '../util';

const MultiSelectField = ({ question }) => {
  const localize = useLocalize();
  return question.dropdown_layout ? (
    <MultipleSelect
      name={question.key}
      options={extractOptions(question, localize)}
    />
  ) : (
    <CheckboxMultiSelect
      name={question.key}
      options={extractOptions(question, localize)}
    />
  );
};

export default MultiSelectField;
