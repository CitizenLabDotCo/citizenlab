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
import { Box } from '@citizenlab/cl2-component-library';

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

const StyledH2 = styled.h2`
  font-size: ${fontSizes.xl}px;
`;

const ButtonsContainer = styled(Box)`
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
        await addInsightsCategory({ insightsViewId: viewId, name });
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
      <Box p="60px" data-testid="insightsDetect">
        <PageTitle>{formatMessage(messages.detectCategoriesTitle)}</PageTitle>
        <Box display="flex" mb="32px">
          <Button
            buttonStyle="text"
            icon="arrow-back"
            padding="0px"
            linkTo={backRoute}
          >
            {formatMessage(messages.detectCategoriesGoBack)}
          </Button>
        </Box>
        <PageWrapper>
          <Box w="60%" mb="40px">
            <StyledH2>
              {formatMessage(messages.detectCategoriesSectionTitle)}
            </StyledH2>
            {detectedCategories.length > 0 ? (
              <p>{formatMessage(messages.detectCategoriesDescription)}</p>
            ) : (
              <p data-testid="insightsDetectEmptyDescription">
                {formatMessage(messages.detectCategoriesEmpty)}
              </p>
            )}
          </Box>
          {detectedCategories.length > 0 && (
            <>
              <Box display="flex" flexWrap="wrap" mb="60px">
                {detectedCategories.map((category) => (
                  <Tag
                    mr="8px"
                    mb="8px"
                    label={category.attributes.name}
                    variant={
                      selectedCategories.includes(category.attributes.name)
                        ? 'primary'
                        : 'default'
                    }
                    key={category.id}
                    size="large"
                    onIconClick={handleCategorySelection(
                      category.attributes.name
                    )}
                  />
                ))}
              </Box>
              <ButtonsContainer
                display="flex"
                data-testid="insightsDetectButtonContainer"
              >
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
            </>
          )}
        </PageWrapper>
      </Box>
    </>
  );
};

export default withRouter(injectIntl(Detect));
