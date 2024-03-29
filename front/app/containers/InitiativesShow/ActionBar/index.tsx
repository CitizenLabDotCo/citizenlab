import React, { memo } from 'react';

import styled from 'styled-components';

import useInitiativeById from 'api/initiatives/useInitiativeById';

import useLocale from 'hooks/useLocale';

import ActionBarLayout from 'components/PostShowComponents/ActionBar';
import BreadCrumbs from 'components/PostShowComponents/Breadcrumbs';

import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import InitiativeMoreActions from './InitiativeMoreActions';

const StyledInitiativeMoreActions = styled(InitiativeMoreActions)``;

interface Props {
  initiativeId: string;
  onTranslateInitiative: () => void;
  translateButtonClicked: boolean;
}

const ActionBar = memo<Props>(
  ({ onTranslateInitiative, translateButtonClicked, initiativeId }) => {
    const { data: initiative } = useInitiativeById(initiativeId);
    const locale = useLocale();

    if (!initiative || isNilOrError(locale)) {
      return null;
    }

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
              initiative={initiative.data}
            />
          )
        }
        initiative={initiative.data}
        locale={locale}
        onTranslate={onTranslateInitiative}
        translateButtonClicked={translateButtonClicked}
      />
    );
  }
);

export default ActionBar;
