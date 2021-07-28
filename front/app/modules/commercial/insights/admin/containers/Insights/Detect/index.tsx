import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import useDetectedCategories from 'modules/commercial/insights/hooks/useInsightsDetectedCategories';
import PageWrapper from 'components/admin/PageWrapper';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import { isNilOrError } from 'utils/helperUtils';
import GoBackButton from 'components/UI/GoBackButton';
import clHistory from 'utils/cl-router/history';
import PageTitle from 'components/admin/PageTitle';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import styled from 'styled-components';
import TopBar from '../../../components/TopBar';
import Button from 'components/UI/Button';

import { fontSizes } from 'utils/styleUtils';
const Container = styled.div`
  padding: 60px;
`;

const StyledGoBackButton = styled(GoBackButton)`
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const detectedCategories = useDetectedCategories(viewId);

  if (isNilOrError(detectedCategories)) {
    return null;
  }

  const handleCategorySelection = (selectedName: string) => () => {
    if (selectedCategories.includes(selectedName)) {
      setSelectedCategories(
        selectedCategories.filter((name) => name !== selectedName)
      );
    } else {
      setSelectedCategories([...selectedCategories, selectedName]);
    }
  };

  const goBack = () => {
    clHistory.push(`/admin/insights/${viewId}/edit`);
  };

  return (
    <>
      <TopBar />
      <Container>
        <PageTitle>{formatMessage(messages.detectCategoriesTitle)}</PageTitle>
        <StyledGoBackButton onClick={goBack} />
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
          <ButtonsContainer>
            <Button buttonStyle="admin-dark">
              {formatMessage(messages.detectCategoriesAddCategory)}
            </Button>
            <Button buttonStyle="secondary">
              {formatMessage(messages.detectCategoriesCancel)}
            </Button>
          </ButtonsContainer>
        </PageWrapper>
      </Container>
    </>
  );
};

export default withRouter(injectIntl(Detect));

// detectCategoriesAddCategory: {
//   id: 'app.containers.Admin.Insights.Detect.addCategory',
//   defaultMessage: 'Add category',
// },
// detectCategoriesAddCategories: {
//   id: 'app.containers.Admin.Insights.Detect.addCategories',
//   defaultMessage: 'Add categories',
// },
