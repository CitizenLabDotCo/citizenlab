import { useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import useObserveEvent from 'hooks/useObserveEvent';

import { useModalQueue } from 'containers/App/ModalQueue';

import { useConsentRequired } from './utils';

const ConsentManager = () => {
  const { queueModal, removeModal } = useModalQueue();

  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');

  const isConsentRequired = useConsentRequired();

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
