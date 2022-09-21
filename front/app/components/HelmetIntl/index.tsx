import React from 'react';
import { Helmet } from 'react-helmet';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import { injectIntl } from 'react-intl';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  title: MessageDescriptor;
  description: MessageDescriptor;
}

const HelmetIntl = ({
  intl: { formatMessage },
  title,
  description,
}: Props & WrappedComponentProps) => {
  const localize = useLocalize();
  const appConfig = useAppConfiguration();

  if (!isNilOrError(appConfig)) {
    return (
      <>
        <Helmet
          title={formatMessage(title, {
            orgName: localize(
              appConfig.attributes.settings.core.organization_name
            ),
          })}
          meta={[{ name: 'description', content: formatMessage(description) }]}
        />
      </>
    );
  }

  return null;
};

export default injectIntl(HelmetIntl);
