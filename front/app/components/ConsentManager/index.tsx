import { useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useObserveEvent from 'hooks/useObserveEvent';

import { useModalQueue } from 'containers/App/ModalQueue';

import eventEmitter from 'utils/eventEmitter';

import { getConsent, ISavedDestinations } from './consent';
import { useConsentRequired, getCurrentPreferences } from './utils';

const ConsentManager = () => {
  const { queueModal, removeModal } = useModalQueue();
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();

  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');

  const isConsentRequired = useConsentRequired();

  // Code that should run every time the app is first loaded.
  // Initialized everything that needs to be initialized,
  // for which cookies already were accepted prior.
  // E.g. if you accepted cookies for intercom last session,
  // this session we need to make sure intercom gets
  // initialized automatically.
  useEffect(() => {
    const consent = getConsent();

    const defaultPreferences = getCurrentPreferences(
      appConfiguration?.data,
      authUser?.data,
      consent
    );

    if (defaultPreferences.functional === undefined) {
      defaultPreferences.functional = true;
    }

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      consent?.savedChoices || {}
    );
  }, [appConfiguration?.data, authUser?.data]);

  useEffect(() => {
    /*
      When we click the link to the cookie policy in the modal, 
      we wouldn't be able to read the cookie policy without this, 
      because the modal is on top of the page.
      Search the codebase for 'from=cookie-modal' to see where this is used.
    */
    if (from === 'cookie-modal') {
      removeModal('consent-modal');
    } else if (isConsentRequired) {
      queueModal('consent-modal');
    }
  }, [from, isConsentRequired, queueModal, removeModal]);

  useObserveEvent('openConsentManager', () => {
    queueModal('consent-modal');
  });

  return null;
};

export default ConsentManager;
