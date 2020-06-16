import React, { memo } from 'react';

// components
import Button from 'components/UI/Button';
import PageWrapper from 'components/admin/PageWrapper';
import { PageTitle } from 'components/admin/Section';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  margin-top: 25px;
  margin-bottom: 25px;
`;

const WorkshopPage = memo<InjectedIntlProps>(({ intl }) => {
  return (
    <>
      <HeaderContainer>
        <PageTitle>
          <FormattedMessage {...messages.pageTitle} />
        </PageTitle>
      </HeaderContainer>

      <PageWrapper>
        <QuillEditedContent textColor={colors.label}>
          <FormattedMessage
            {...messages.pageDescription}
            values={{
              link:
                // tslint:disable-next-line:react-a11y-anchors
                <a href={intl.formatMessage(messages.supportGuideLinkUrl)}>
                  <FormattedMessage {...messages.supportGuideLinkText} />
                </a>
              }}
          />
        </QuillEditedContent>

        <ButtonWrapper>
          <Button linkTo={`${window.location.origin}/workshops`}>
            <FormattedMessage {...messages.manageWorkshops} />
          </Button>
        </ButtonWrapper>

        <QuillEditedContent textColor={colors.label}>
          <a href={intl.formatMessage(messages.learnHowToCreateWorkshopLinkUrl)}>
            {/* // tslint:disable-next-line:react-a11y-anchors */}
            <FormattedMessage {...messages.learnHowToCreateWorkshopLinkText} />
          </a>
        </QuillEditedContent>
      </PageWrapper>
    </>
  );
});

export default injectIntl(WorkshopPage);
