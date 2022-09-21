import React, { memo } from 'react';

// components
import Button from 'components/UI/Button';
import PageWrapper from 'components/admin/PageWrapper';
import { PageTitle, SectionDescription } from 'components/admin/Section';
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
  flex-direction: column;
  padding: 0;
  margin: 0;
  margin-bottom: 30px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  margin-bottom: 25px;
`;

const WorkshopPage = memo<InjectedIntlProps>(({ intl }) => {
  return (
    <>
      <HeaderContainer>
        <PageTitle>
          <FormattedMessage {...messages.pageTitle} />
        </PageTitle>
        <SectionDescription>
          <FormattedMessage {...messages.pageDescription} />
        </SectionDescription>
      </HeaderContainer>

      <PageWrapper>
        <ButtonWrapper>
          <Button linkTo={`${window.location.origin}/workshops`}>
            <FormattedMessage {...messages.manageWorkshops} />
          </Button>
        </ButtonWrapper>

        <QuillEditedContent textColor={colors.label}>
          <FormattedMessage
            {...messages.workshopsIntro}
            values={{
              readSupportGuideLink: (
                <a
                  href={intl.formatMessage(messages.supportGuideLinkUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage {...messages.supportGuideLinkCopy} />
                </a>
              ),
              createWorkshopArticleLink: (
                <a
                  href={intl.formatMessage(
                    messages.learnHowToCreateWorkshopLinkUrl
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage
                    {...messages.learnHowToCreateWorkshopLinkCopy}
                  />
                </a>
              ),
            }}
          />
        </QuillEditedContent>
      </PageWrapper>
    </>
  );
});

export default injectIntl(WorkshopPage);
