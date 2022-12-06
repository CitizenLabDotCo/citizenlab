import React from 'react';
import { IOption } from '@citizenlab/cl2-component-library';
// typings
import { InputTerm } from 'services/participationContexts';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import messages from '../../messages';
import { StyledSelect } from './styling';

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
