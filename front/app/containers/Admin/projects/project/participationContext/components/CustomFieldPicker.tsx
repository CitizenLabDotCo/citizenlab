import React from 'react';

// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { StyledSelect } from './styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// typings
import { InputTerm } from 'services/participationContexts';
import { IOption } from '@citizenlab/cl2-component-library';

interface Props {
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  inputTermOptions: IOption[];
}

export default ({
  input_term,
  handleInputTermChange,
  inputTermOptions,
}: Props) => (
  <SectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.inputTermSelectLabel} />
    </SubSectionTitle>
    <StyledSelect
      value={input_term}
      options={inputTermOptions}
      onChange={handleInputTermChange}
    />
  </SectionField>
);
