import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// hooks
import useDetectedCategories from 'modules/commercial/insights/hooks/useInsightsDetectedCategories';

// components
import PageWrapper from 'components/admin/PageWrapper';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import PageTitle from 'components/admin/PageTitle';
import TopBar from '../../../components/TopBar';
import Button from 'components/UI/Button';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// styles
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// services
import { addInsightsCategory } from 'modules/commercial/insights/services/insightsCategories';

const Container = styled.div`
  padding: 60px;
`;

const GoBackButtonContainer = styled.div`
  display: flex;
  margin-bottom: 32px;
`;

const StyledSectionHeader = styled.div`
  width: 60%;
  margin-bottom: 40px;
  h2 {
    font-size: ${fontSizes.xl}px;
  }
`;

const CategoriesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 60px;
  > * {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  > * {
    margin-right: 8px;
  }
`;

const Detect = ({
  params: { viewId },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const [processing, setProcessing] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const detectedCategories = useDetectedCategories(viewId);

  const backRoute = `/admin/insights/${viewId}/edit`;
  if (isNilOrError(detectedCategories)) {
    return null;
  }

  const goBack = () => {
    clHistory.push(backRoute);
  };

  const handleAddCategories = async () => {
    setProcessing(true);
    for (const name of selectedCategories) {
      try {
        await addInsightsCategory(viewId, name);
      } catch {
        // Do nothing
      }
    }
    setProcessing(false);
    goBack();
  };

  const handleCategorySelection = (selectedName: string) => () => {
    if (selectedCategories.includes(selectedName)) {
      setSelectedCategories(
        selectedCategories.filter((name) => name !== selectedName)
      );
    } else {
      setSelectedCategories([...selectedCategories, selectedName]);
    }
  };

  return (
    <>
      <TopBar />
      <Container data-testid="insightsDetect">
        <PageTitle>{formatMessage(messages.detectCategoriesTitle)}</PageTitle>
        <GoBackButtonContainer>
          <Button
            buttonStyle="text"
            icon="arrow-back"
            padding="0px"
            linkTo={backRoute}
          >
            {formatMessage(messages.detectCategoriesGoBack)}
          </Button>
        </GoBackButtonContainer>
        <PageWrapper>
          <StyledSectionHeader>
            <h2>{formatMessage(messages.detectCategoriesSectionTitle)}</h2>
            <p>{formatMessage(messages.description)}</p>
          </StyledSectionHeader>
          <CategoriesList>
            {detectedCategories.names.map((name) => (
              <Tag
                label={name}
                variant={
                  selectedCategories.includes(name) ? 'primary' : 'default'
                }
                key={name}
                size="large"
                onIconClick={handleCategorySelection(name)}
              />
            ))}
          </CategoriesList>
          <ButtonsContainer data-testid="insightsDetectButtonContainer">
            <Button
              buttonStyle="admin-dark"
              disabled={selectedCategories.length === 0}
              processing={processing}
              onClick={handleAddCategories}
            >
              {selectedCategories.length === 1
                ? formatMessage(messages.detectCategoriesAddCategory)
                : formatMessage(messages.detectCategoriesAddCategories)}
              {selectedCategories.length
                ? ` (${selectedCategories.length})`
                : ''}
            </Button>
            <Button buttonStyle="secondary" linkTo={backRoute}>
              {formatMessage(messages.detectCategoriesCancel)}
            </Button>
          </ButtonsContainer>
        </PageWrapper>
      </Container>
    </>
  );
};

export default withRouter(injectIntl(Detect));
