import React, { memo } from 'react';

import useInitiativeById from 'api/initiatives/useInitiativeById';

import ActionBarLayout from 'components/PostShowComponents/ActionBar';
import BreadCrumbs from 'components/PostShowComponents/Breadcrumbs';

import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import InitiativeMoreActions from './InitiativeMoreActions';

interface Props {
  initiativeId: string;
  onTranslateInitiative: () => void;
  translateButtonClicked: boolean;
}

const ActionBar = memo<Props>(
  ({ onTranslateInitiative, translateButtonClicked, initiativeId }) => {
    const { data: initiative } = useInitiativeById(initiativeId);

    if (!initiative) {
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
            <InitiativeMoreActions
              id="e2e-initiative-more-actions-desktop"
              initiative={initiative.data}
            />
          )
        }
        initiative={initiative.data}
        onTranslate={onTranslateInitiative}
        translateButtonClicked={translateButtonClicked}
      />
    );
  }
);

export default ActionBar;
