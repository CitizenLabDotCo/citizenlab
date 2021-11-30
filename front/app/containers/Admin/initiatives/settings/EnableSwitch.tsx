import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { StyledSectionDescription } from '.';

// hooks
import useNavbarItemEnabled from 'hooks/useNavbarItemEnabled';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import { Toggle } from 'cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { isNilOrError } from 'utils/helperUtils';

const StyledToggle = styled(Toggle)`
  margin-right: 10px;
`;

interface Props {
  setParentState: (state: any) => void;
}

export default ({ setParentState }: Props) => {
  const proposalsNavbarItemEnabled = useNavbarItemEnabled('proposals');

  const [proposalsNavbarToggleValue, setProposalsNavbarToggleValue] = useState<
    undefined | boolean
  >(undefined);

  const toggleProposalsNavbarValue = () =>
    setProposalsNavbarToggleValue(!proposalsNavbarToggleValue);

  useEffect(() => {
    if (isNilOrError(proposalsNavbarItemEnabled)) return;
    setProposalsNavbarToggleValue(proposalsNavbarItemEnabled);
  }, [proposalsNavbarItemEnabled]);

  useEffect(() => {
    setParentState({
      updateProposalsInNavbar:
        proposalsNavbarToggleValue === proposalsNavbarItemEnabled
          ? null
          : proposalsNavbarToggleValue,
    });
  }, [proposalsNavbarToggleValue]);

  return (
    <SectionField>
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.showProposalEnabled} />
      </SubSectionTitleWithDescription>
      <StyledSectionDescription>
        <FormattedMessage {...messages.showProposalEnabledInfo} />
      </StyledSectionDescription>
      {proposalsNavbarToggleValue !== undefined && (
        <StyledToggle
          checked={proposalsNavbarToggleValue}
          onChange={toggleProposalsNavbarValue}
          label={<FormattedMessage {...messages.enabledToggle} />}
        />
      )}
    </SectionField>
  );
};
