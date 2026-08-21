import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

interface Props {
  disclosureMessage: MessageDescriptor;
}

const ConsentDisclosure = ({ disclosureMessage }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  return (
    <Text fontSize="s" color="tenantText">
      <FormattedMessage
        {...disclosureMessage}
        values={{
          orgName: localize(
            appConfiguration?.data.attributes.settings.core.organization_name
          ),
          termsLink: (
            <Link
              target="_blank"
              to="/pages/$slug"
              params={{ slug: 'terms-and-conditions' }}
            >
              <FormattedMessage {...messages.termsLinkText} />
            </Link>
          ),
          privacyLink: (
            <Link
              target="_blank"
              to="/pages/$slug"
              params={{ slug: 'privacy-policy' }}
            >
              <FormattedMessage {...messages.privacyLinkText} />
            </Link>
          ),
        }}
      />
    </Text>
  );
};

export default ConsentDisclosure;
