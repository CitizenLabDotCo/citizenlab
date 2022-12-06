import React, { memo } from 'react';
import { adopt } from 'react-adopt';
// styling
import styled from 'styled-components';
// resource
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
// utils
import { isNilOrError } from 'utils/helperUtils';
import ActionBarLayout from 'components/PostShowComponents/ActionBar';
// components
import BreadCrumbs from 'components/PostShowComponents/Breadcrumbs';
import messages from '../messages';
import InitiativeMoreActions from './InitiativeMoreActions';

const StyledInitiativeMoreActions = styled(InitiativeMoreActions)``;

interface InputProps {
  initiativeId: string;
  onTranslateInitiative: () => void;
  translateButtonClicked: boolean;
}

interface DataProps {
  initiative: GetInitiativeChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

const ActionBar = memo<Props>(
  ({ onTranslateInitiative, translateButtonClicked, initiative, locale }) => {
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
        initiative={initiative}
        locale={locale}
        onTranslate={onTranslateInitiative}
        translateButtonClicked={translateButtonClicked}
      />
    );
  }
);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ActionBar {...inputProps} {...dataProps} />}
  </Data>
);
