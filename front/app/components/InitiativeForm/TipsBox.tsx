import React, { memo } from 'react';

// components
import TipsContent from './TipsContent';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { darken } from 'polished';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

interface Props {
  className?: string;
}

const Container = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  border: 1px solid #e7e7e7;
  background: ${darken(0.045, colors.background)};
`;

const TipsTitle = styled.h2`
  font-size: ${fontSizes.l}px;
  line-height: 24px;
  font-weight: 600;
  margin-bottom: 0;
`;

const TipsBox = memo(({ className }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  const postingTips = localize(
    appConfiguration?.data.attributes.settings.initiatives.posting_tips
  );

  if (postingTips.length === 0) return null;

  return (
    <Container className={`${className} e2e-tips`}>
      <TipsTitle>
        <FormattedMessage {...messages.tipsTitle} />
      </TipsTitle>
      <TipsContent />
    </Container>
  );
});

export default TipsBox;
