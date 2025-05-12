import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { IFlatCustomField } from 'api/custom_fields/types';
import useCustomFields from 'api/custom_fields/useCustomFields';
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import { ParticipationMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';

import CustomFieldsPage from './CustomFieldsPage';

const convertCustomFieldsToNestedPages = (customFields: IFlatCustomField[]) => {
  const nestedPagesData: {
    page: IFlatCustomField;
    pageQuestions: IFlatCustomField[];
  }[] = [];

  customFields.forEach((field) => {
    if (field.input_type === 'page') {
      nestedPagesData.push({
        page: field,
        pageQuestions: [],
      });
    } else {
      const lastPagesElement = nestedPagesData[nestedPagesData.length - 1];
      lastPagesElement.pageQuestions.push({
        ...field,
      });
    }
  });

  return nestedPagesData;
};

const CustomFieldsForm = ({
  projectId,
  phaseId,
  participationMethod,
}: {
  projectId: string;
  phaseId?: string;
  participationMethod?: ParticipationMethod;
}) => {
  const { slug } = useParams() as { slug: string };
  const { data: phase } = usePhase(phaseId);
  const { data: idea } = useIdeaBySlug(slug);
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId: participationMethod !== 'ideation' ? phaseId : undefined,
  });

  const [formValues, setFormValues] = useState<any>({});
  const [currentPageNumber, setCurrentPageNumber] = useState(0);

  const nestedPagesData = convertCustomFieldsToNestedPages(customFields || []);
  const showTogglePostAnonymously =
    phase?.data.attributes.allow_anonymous_participation &&
    participationMethod !== 'native_survey';

  return (
    <Box overflow="scroll" w="100%">
      {nestedPagesData[currentPageNumber] && (
        <CustomFieldsPage
          key={nestedPagesData[currentPageNumber].page.id}
          page={nestedPagesData[currentPageNumber].page}
          pageQuestions={nestedPagesData[currentPageNumber].pageQuestions}
          currentPageNumber={currentPageNumber}
          lastPageNumber={nestedPagesData.length - 1}
          setCurrentPageNumber={setCurrentPageNumber}
          showTogglePostAnonymously={showTogglePostAnonymously}
          participationMethod={participationMethod}
          idea={idea}
          projectId={projectId}
          onSubmit={(formValues) => {
            setFormValues((prevValues) => ({
              ...prevValues,
              ...formValues,
            }));
          }}
          pageButtonLabelMultiloc={
            customFields?.find(
              (field) => field.id === nestedPagesData[currentPageNumber].page.id
            )?.page_button_label_multiloc
          }
          phase={phase?.data}
          defaultValues={formValues}
        />
      )}
    </Box>
  );
};

export default CustomFieldsForm;
