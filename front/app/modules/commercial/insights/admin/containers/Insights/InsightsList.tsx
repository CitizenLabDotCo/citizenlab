import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import useLocale from 'hooks/useLocale';

// components
import PageTitle from 'components/admin/PageTitle';
import { Button } from 'cl2-component-library';
import { Divider } from 'semantic-ui-react';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

import { IInsightsViewData } from '../../../services/insightsViews';

const StyledDescription = styled.p`
  font-size: ${fontSizes.base}px;
  width: 60%;
  margin: 0;
`;

const StyledLink = styled.a`
  cursor: pointer;
  font-size: ${fontSizes.base}px;
  color: ${colors.clBlue};
  font-weight: 600;
  text-decoration: underline;
  &:hover {
    color: ${darken(0.2, colors.clBlue)};
    text-decoration: underline;
  }
`;

const InsightsContainer = styled.div`
  margin-top: 40px;
  background-color: ${colors.adminContentBackground};
  padding: 60px 70px;
  font-size: ${fontSizes.base}px;
`;

const InsightsContainerTitle = styled.h2`
  font-size: ${fontSizes.xl}px;
`;

const InsightsContainerHeader = styled.div`
  display: flex;
  margin-bottom: 60px;
  justify-content: space-between;
  > div:first-child {
    width: 50%;
  }
`;

const InsightsListItem = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  h3 {
    font-size: ${fontSizes.base}px;
    font-weight: bold;
  }
  .buttons {
    display: flex;
    > * {
      margin-left: 8px;
    }
  }
`;

type InsightsList = {
  data: IInsightsViewData[];
  openCreateModal: () => void;
};

const InsightsList: React.FC<InsightsList & InjectedIntlProps> = ({
  intl: { formatMessage },
  data,
  openCreateModal,
}) => {
  const locale = useLocale();
  return (
    <div>
      <PageTitle>{formatMessage(messages.title)}</PageTitle>
      <StyledDescription>
        {formatMessage(messages.description)}
      </StyledDescription>
      <StyledLink>{formatMessage(messages.link)}</StyledLink>
      {!isNilOrError(locale) && (
        <InsightsContainer>
          <InsightsContainerHeader>
            <div>
              <InsightsContainerTitle>
                {formatMessage(messages.listTitle)}
              </InsightsContainerTitle>
              <p>{formatMessage(messages.listDescription)}</p>
            </div>
            <Button
              locale={locale}
              bgColor={colors.adminTextColor}
              onClick={openCreateModal}
            >
              {formatMessage(messages.listCreate)}
            </Button>
          </InsightsContainerHeader>
          {data.map((view) => (
            <>
              <InsightsListItem>
                <h3> {view.attributes.name}</h3>
                <div className="buttons">
                  <Button
                    locale={locale}
                    buttonStyle="white"
                    icon="copy"
                    textColor={colors.adminTextColor}
                    boxShadow="none"
                  >
                    {formatMessage(messages.listDuplicate)}
                  </Button>
                  <Button
                    locale={locale}
                    buttonStyle="white"
                    icon="delete"
                    textColor={colors.adminTextColor}
                    boxShadow="none"
                  >
                    {formatMessage(messages.listDelete)}
                  </Button>
                  <Button locale={locale} buttonStyle="secondary" icon="edit">
                    {formatMessage(messages.listManage)}
                  </Button>
                </div>
              </InsightsListItem>
              <Divider />
            </>
          ))}
        </InsightsContainer>
      )}
    </div>
  );
};

export default injectIntl(InsightsList);
