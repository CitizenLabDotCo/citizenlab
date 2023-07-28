import React from 'react';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// components
import { PageTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';
import Divider from 'components/admin/Divider';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// api
import useDeleteView from 'modules/commercial/insights/api/views/useDeleteView';
import { IInsightsViewData } from 'modules/commercial/insights/api/views/types';

const StyledDescription = styled.p`
  font-size: ${fontSizes.base}px;
  width: 60%;
  margin: 0;
`;

const StyledLink = styled.a`
  cursor: pointer;
  font-size: ${fontSizes.base}px;
  color: ${colors.teal};
  font-weight: 600;
  text-decoration: underline;
  &:hover {
    color: ${darken(0.2, colors.teal)};
    text-decoration: underline;
  }
`;

const InsightsContainer = styled.div`
  margin-top: 40px;
  background-color: ${colors.white};
  padding: 60px 70px;
  font-size: ${fontSizes.base}px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
`;

const InsightsContainerTitle = styled.h2`
  font-size: ${fontSizes.xl}px;
`;

const InsightsContainerHeader = styled.div`
  display: flex;
  margin-bottom: 60px;
  justify-content: space-between;
  p {
    color: ${colors.textSecondary};
  }
  > div:first-child {
    width: 50%;
  }
`;

const InsightsListItem = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 {
    font-size: ${fontSizes.base}px;
    font-weight: bold;
    margin-bottom: 4px;
  }
  p {
    font-size: ${fontSizes.xs}px;
    color: ${colors.textSecondary};
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

const InsightsList: React.FC<InsightsList & WrappedComponentProps> = ({
  intl: { formatMessage, formatDate },
  data,
  openCreateModal,
}) => {
  const mutation = useDeleteView();
  const handleDeleteClick = (viewId: string) => () => {
    const deleteMessage = formatMessage(messages.listDeleteConfirmation);

    if (window.confirm(deleteMessage)) {
      mutation.mutate(viewId);
    }
  };

  return (
    <div data-testid="insightsList">
      <PageTitle>{formatMessage(messages.title)}</PageTitle>
      <StyledDescription>
        {formatMessage(messages.description)}
      </StyledDescription>
      <StyledLink
        target="_blank"
        rel="noreferrer"
        href={formatMessage(messages.supportLinkUrl)}
      >
        {formatMessage(messages.link)}
      </StyledLink>
      <InsightsContainer>
        <InsightsContainerHeader>
          <div>
            <InsightsContainerTitle>
              {formatMessage(messages.listTitle)}
            </InsightsContainerTitle>
            <p>{formatMessage(messages.listDescription)}</p>
          </div>
          <Button
            className="intercom-admin-create-insights-button"
            bgColor={colors.primary}
            onClick={openCreateModal}
          >
            {formatMessage(messages.listCreate)}
          </Button>
        </InsightsContainerHeader>
        {data.map((view) => (
          <div key={view.id} data-testid="insightsListItem">
            <InsightsListItem>
              <div>
                <h3> {view.attributes.name}</h3>
                <p>{formatDate(view.attributes.updated_at)}</p>
              </div>
              <div className="buttons">
                {/* <Button
                    buttonStyle="white"
                    icon="copy"
                    textColor={colors.primary}
                    boxShadow="none"
                  >
                    {formatMessage(messages.listDuplicate)}
                  </Button> */}
                <Button
                  buttonStyle="white"
                  icon="delete"
                  textColor={colors.textSecondary}
                  boxShadow="none"
                  onClick={handleDeleteClick(view.id)}
                >
                  {formatMessage(messages.listDelete)}
                </Button>
                <Button
                  buttonStyle="secondary"
                  icon="edit"
                  linkTo={`/admin/reporting/insights/${view.id}`}
                >
                  {formatMessage(messages.listManage)}
                </Button>
              </div>
            </InsightsListItem>
            <Divider />
          </div>
        ))}
      </InsightsContainer>
    </div>
  );
};

export default injectIntl(InsightsList);
