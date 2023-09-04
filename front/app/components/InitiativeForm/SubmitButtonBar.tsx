import React from 'react';
import ContentContainer from 'components/ContentContainer';
import styled, { useTheme } from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import { media } from 'utils/styleUtils';
import messages from './messages';
import useInitiativeReviewRequired from 'hooks/useInitiativeReviewRequired';

const StyledButton = styled(Button)`
  margin-right: 10px;
`;

const SubmitFooterContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  z-index: 1;
  ${media.tablet`
    align-items: center;
  `}
`;
const StyledContentContainer = styled(ContentContainer)`
  ${media.tablet`
    max-width: 620px;
  `}
`;

const SubmitFooterInner = styled.div`
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  padding-bottom: 12px;
  background: #fff;

  ${media.phone`
    padding: 10px;
  `}
`;

interface FormSubmitFooterProps {
  processing: boolean;
  className?: string;
}

const SubmitButtonBar = ({ className, processing }: FormSubmitFooterProps) => {
  const theme = useTheme();
  const initiativeReviewRequired = useInitiativeReviewRequired();

  return (
    <SubmitFooterContainer className={className}>
      <StyledContentContainer mode="page">
        <SubmitFooterInner>
          <StyledButton
            id="e2e-initiative-publish-button"
            fontWeight="500"
            padding="13px 22px"
            bgColor={theme.colors.tenantPrimary}
            textColor="#FFF"
            type="submit"
            processing={processing}
          >
            <FormattedMessage
              {...(initiativeReviewRequired
                ? messages.submitButton
                : messages.publishButton)}
            />
          </StyledButton>
        </SubmitFooterInner>
      </StyledContentContainer>
    </SubmitFooterContainer>
  );
};

export default SubmitButtonBar;
