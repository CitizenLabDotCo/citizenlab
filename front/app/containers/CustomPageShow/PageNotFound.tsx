import React from 'react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components and styling
import Button from 'components/UI/Button';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const PageNotFoundWrapper = styled.div`
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
`;

const PageNotFound = () => {
  const { formatMessage } = useIntl();

  return (
    <PageNotFoundWrapper>
      <p>{formatMessage(messages.notFound)}</p>
      <Button
        linkTo="/"
        text={formatMessage(messages.goBack)}
        icon="arrow-left"
      />
    </PageNotFoundWrapper>
  );
};

export default PageNotFound;
