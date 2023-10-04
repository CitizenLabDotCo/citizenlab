import React from 'react';

// styles
import styled, { useTheme } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  padding: 20px;
`;

const TipsContent = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();
  const theme = useTheme();

  if (!appConfiguration) return null;

  const initiativeSettings =
    appConfiguration.data.attributes.settings.initiatives;

  return (
    <Container>
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div
          dangerouslySetInnerHTML={{
            __html: localize(initiativeSettings.posting_tips),
          }}
        />
      </QuillEditedContent>
    </Container>
  );
};

export default TipsContent;
