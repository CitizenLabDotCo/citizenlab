import { BadgeIcon } from 'components/Avatar';
import ErrorBoundary from 'components/ErrorBoundary';
import FeatureFlag from 'components/FeatureFlag';
import React, { Suspense } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import { colors } from 'utils/styleUtils';

import VerificationBadge from './citizen/components/VerificationBadge';
import VerificationModal from './citizen/components/VerificationModal';
import VerificationSignUpSteps from './citizen/components/VerificationSignUpSteps';
import VerificationStatus from './citizen/components/VerificationStatus';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [],
  },
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <VerificationSignUpSteps {...props} />
    ),
    'app.containers.UserEditPage.content': () => <VerificationStatus />,
    'app.containers.Navbar.UserMenu.UserNameContainer': (props) => (
      <VerificationBadge {...props} />
    ),
    'app.containers.App.modals': ({ onMounted }) => (
      <ErrorBoundary>
        <Suspense fallback={null}>
          <VerificationModal onMounted={() => onMounted('verification')} />
        </Suspense>
      </ErrorBoundary>
    ),
    'app.components.Avatar.badges': ({
      addVerificationBadge,
      user,
      badgeSize,
    }) => {
      if (user?.attributes?.verified && addVerificationBadge) {
        return (
          <FeatureFlag name="verification">
            <BadgeIcon
              name="checkmark-full"
              size={badgeSize}
              fill={colors.clGreen}
            />
          </FeatureFlag>
        );
      }
      return null;
    },
  },
};

export default configuration;
