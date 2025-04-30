import React, { useState } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IIdea } from 'api/ideas/types';
import { ParticipationMethod } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import ProfileVisiblity from 'containers/IdeasNewPage/IdeasNewIdeationForm/ProfileVisibility';

import AnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal';
import SubmissionReference from 'components/Form/Components/Layouts/SubmissionReference';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';
import { isPage } from 'utils/helperUtils';

import CustomFields from './CustomFields';
import generateYupValidationSchema from './generateYupSchema';

type CustomFieldsPage = {
  page: IFlatCustomField;
  pageQuestions: IFlatCustomField[];
  index: number;
  lastPageIndex: number;
  showTogglePostAnonymously?: boolean;
  participationMethod?: ParticipationMethod;
  idea?: IIdea;
};

const CustomFieldsPage = ({
  page,
  pageQuestions,
  index,
  lastPageIndex,
  showTogglePostAnonymously,
  participationMethod,
  idea,
}: CustomFieldsPage) => {
  const { formatMessage } = useIntl();
  const pagesRef = React.useRef<HTMLDivElement>(null);
  const isMapPage = page.page_layout === 'map';
  const currentPageIndex = index; // Assuming this is the current page index
  const isMobileOrSmaller = useBreakpoint('phone');
  const localize = useLocalize();
  const theme = useTheme();
  const isIdeaEditPage = isPage('idea_edit', location.pathname);
  const [postAnonymously, setPostAnonymously] = useState(
    idea?.data.attributes.anonymous || false
  );
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);

  const handleOnChangeAnonymousPosting = () => {
    if (!postAnonymously) {
      setShowAnonymousConfirmationModal(true);
    }

    setPostAnonymously((postAnonymously) => !postAnonymously);
  };

  const schema = generateYupValidationSchema({
    pageQuestions,
    formatMessage,
    localize,
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues) => {
    console.log(formValues);
  };

  return (
    <Box
      id="container"
      display="flex"
      flexDirection={isMobileOrSmaller ? 'column' : 'row'}
      height="100%"
      w="100%"
      data-cy={`e2e-page-number-${currentPageIndex + 1}`}
    >
      {/* {isMapPage && (
        <Box
          id="map_page"
          w={isMobileOrSmaller ? '100%' : '60%'}
          minWidth="60%"
          h="100%"
            ref={draggableDivRef}
            key={`esri_map_${currentStepNumber}`}
        >
          <EsriMap
            layers={mapLayers}
            initialData={{
              showLegend: true,
              showLayerVisibilityControl: true,
              showLegendExpanded: true,
              showZoomControls: isMobileOrSmaller ? false : true,
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              zoom: Number(mapConfig?.data?.attributes.zoom_level),
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              center: mapConfig?.data?.attributes.center_geojson,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
            height="100%"
          />
        </Box>
      )} */}

      <Box flex={'1 1 auto'} overflowY="auto" h="100%" ref={pagesRef}>
        {/* {isMapPage && isMobileOrSmaller && (
          <Box
            aria-hidden={true}
            height="30px"
            py="20px"
            ref={dragDividerRef}
            position="absolute"
            background={colors.white}
            w="100%"
            zIndex="1000"
          >
            <Box
              mx="auto"
              w="40px"
              h="4px"
              bgColor={colors.grey400}
              borderRadius="10px"
            />
          </Box>
        )} */}
        <Box
          display="flex"
          flexDirection="column"
          height="100%"
          mt={isMapPage && isMobileOrSmaller ? '20px' : undefined}
        >
          <Box h="100%" display="flex" flexDirection="column">
            <Box p="24px" w="100%">
              <Box display="flex" flexDirection="column">
                {/* {allowsAnonymousPostingInNativeSurvey && (
                  <Box w="100%" mb="12px">
                    <Warning icon="shield-checkered">
                      {formatMessage(messages.anonymousSurveyMessage)}
                    </Warning>
                  </Box>
                )} */}

                <Title
                  as="h1"
                  variant={isMobileOrSmaller ? 'h2' : 'h1'}
                  m="0"
                  mb="20px"
                  color="tenantPrimary"
                >
                  {localize(page.title_multiloc)}
                </Title>

                <Box mb="48px">
                  <QuillEditedContent
                    fontWeight={400}
                    textColor={theme.colors.tenantText}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: localize(page.description_multiloc),
                      }}
                    />
                  </QuillEditedContent>
                </Box>
                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onFormSubmit)}>
                    <CustomFields questions={pageQuestions} />
                    <button type="submit">submit</button>
                  </form>
                </FormProvider>

                {index === lastPageIndex - 1 &&
                  showTogglePostAnonymously &&
                  !isIdeaEditPage && (
                    <ProfileVisiblity
                      postAnonymously={postAnonymously}
                      onChange={handleOnChangeAnonymousPosting}
                    />
                  )}
                {index === lastPageIndex && idea && (
                  <SubmissionReference
                    inputId={idea.data.id}
                    participationMethod={participationMethod}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {showAnonymousConfirmationModal && (
        <AnonymousParticipationConfirmationModal
          onCloseModal={() => {
            setShowAnonymousConfirmationModal(false);
          }}
        />
      )}
    </Box>
  );
};

export default CustomFieldsPage;
