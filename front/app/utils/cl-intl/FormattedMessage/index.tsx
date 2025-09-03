import React from 'react';

import { isRtl } from '@citizenlab/cl2-component-library';
// eslint-disable-next-line no-restricted-imports
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

type Props = {
  'data-cy'?: string;
  formatBold?: boolean;
} & React.ComponentProps<typeof OriginalFormattedMessage>;

const RtlBox = styled.span`
  ${isRtl`
      direction: rtl;
  `}
`;

const FormattedMessageComponent = (props: Props) => {
  const { data: appConfig } = useAppConfiguration();
  const localize = useLocalize();

  if (!appConfig) {
    return null;
  }

  return (
    <RtlBox data-cy={props['data-cy']}>
      <OriginalFormattedMessage
        {...props}
        values={{
          ...props.values,
          ...(props.formatBold
            ? {
                b: (chunks) => (
                  <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                ),
              }
            : {}),
          tenantName: appConfig.data.attributes.name,
          orgType: appConfig.data.attributes.settings.core.organization_type,
          orgName: localize(
            appConfig.data.attributes.settings.core.organization_name
          ),
        }}
      />
    </RtlBox>
  );
};

export default FormattedMessageComponent;
