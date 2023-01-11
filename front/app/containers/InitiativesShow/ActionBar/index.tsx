import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// components
import BreadCrumbs from 'components/PostShowComponents/Breadcrumbs';
import ActionBarLayout from 'components/PostShowComponents/ActionBar';
import InitiativeMoreActions from './InitiativeMoreActions';

// resource
import { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// styling
import styled from 'styled-components';

const StyledInitiativeMoreActions = styled(InitiativeMoreActions)``;

interface InputProps {}

interface DataProps {
  initiative: GetInitiativeChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

const ActionBar = memo<Props>(({ initiative }) => {
  return (
    <ActionBarLayout
      leftContent={
        <BreadCrumbs
          postType="initiative"
          links={[
            {
              text: {
                message: messages.allInitiatives,
              },
              to: '/initiatives',
            },
          ]}
        />
      }
      rightContent={
        isNilOrError(initiative) ? null : (
          <StyledInitiativeMoreActions
            id="e2e-initiative-more-actions-desktop"
            initiative={initiative}
          />
        )
      }
    />
  );
});

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ActionBar {...inputProps} {...dataProps} />}
  </Data>
);
