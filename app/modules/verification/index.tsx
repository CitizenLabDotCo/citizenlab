import ErrorBoundary from 'components/ErrorBoundary';
import React, { Suspense } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
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
  },
};

export default configuration;
