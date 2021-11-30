import React from 'react';
import styled from 'styled-components';
import { StyledSectionDescription, FieldProps } from '.';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import { Toggle } from 'cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledToggle = styled(Toggle)`
  margin-right: 10px;
`;

export default ({ formValues, setParentState }: FieldProps) => {
  const handleEnabledOnChange = (event: React.FormEvent) => {
    event.preventDefault();

    setParentState(({ formValues }) => {
      const { enabled } = formValues;

      return {
        formValues: {
          ...formValues,
          enabled: !enabled,
        },
      };
    });
  };

  return (
    <SectionField>
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.showProposalEnabled} />
      </SubSectionTitleWithDescription>
      <StyledSectionDescription>
        <FormattedMessage {...messages.showProposalEnabledInfo} />
      </StyledSectionDescription>
      <StyledToggle
        checked={formValues.enabled}
        onChange={handleEnabledOnChange}
        label={<FormattedMessage {...messages.enabledToggle} />}
      />
    </SectionField>
  );
};
