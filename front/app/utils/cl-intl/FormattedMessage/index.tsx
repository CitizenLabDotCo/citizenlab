import React from 'react';

// eslint-disable-next-line no-restricted-imports
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

type Props = {
  'data-cy'?: string;
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
