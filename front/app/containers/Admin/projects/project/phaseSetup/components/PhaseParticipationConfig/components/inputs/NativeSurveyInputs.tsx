import React from 'react';

import { CLErrors, Multiloc } from 'typings';

import { IPhase, IUpdatedPhaseProperties } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import UserFieldsInSurveyToggle from 'components/admin/UserFieldsInSurveyToggle/UserFieldsInSurveyToggle';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';

import parentMessages from '../../../../messages';

interface Props {
  user_fields_in_form: boolean | null | undefined;
  apiErrors: CLErrors | null;
  phase?: IPhase;
  formData: IUpdatedPhaseProperties;
  handleUserFieldsInFormOnChange: (user_fields_in_survey: boolean) => void;
  handleSurveyTitleChange: (
    value: Multiloc,
    locale: string | undefined
  ) => void;
  handleSurveyCTAChange: (value: Multiloc, locale: string | undefined) => void;
}

const NativeSurveyInputs = ({
  user_fields_in_form,
  apiErrors,
  phase,
  formData,
  handleUserFieldsInFormOnChange,
  handleSurveyTitleChange,
  handleSurveyCTAChange,
}: Props) => {
  const localize = useLocalize();
  const { data: project } = useProjectById(
    phase?.data.relationships.project.data.id
  );

  return (
    <>
      <UserFieldsInSurveyToggle
        userFieldsInForm={user_fields_in_form}
        handleUserFieldsInFormOnChange={handleUserFieldsInFormOnChange}
      />

      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...parentMessages.surveyTitleLabel} />
        </SubSectionTitle>
        <InputMultilocWithLocaleSwitcher
          id="title"
          type="text"
          valueMultiloc={formData.native_survey_title_multiloc}
          onChange={handleSurveyTitleChange}
        />
        <Error
          apiErrors={apiErrors && apiErrors.native_survey_title_multiloc}
        />
      </SectionField>

      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...parentMessages.surveyCTALabel} />
        </SubSectionTitle>
        <InputMultilocWithLocaleSwitcher
          id="title"
          type="text"
          valueMultiloc={formData.native_survey_button_multiloc}
          onChange={handleSurveyCTAChange}
        />
        <Error
          apiErrors={apiErrors && apiErrors.native_survey_button_multiloc}
        />
      </SectionField>

      <SectionField>
        <SubSectionTitle>
          <FormattedMessage {...parentMessages.previewSurveyCTALabel} />
        </SubSectionTitle>
        <ButtonWithLink
          width="fit-content"
          onClick={(event) => {
            if (phase) {
              window.open(
                `/projects/${project?.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`,
                '_blank'
              );
            }
            event.preventDefault();
          }}
        >
          {localize(formData.native_survey_button_multiloc)}
        </ButtonWithLink>
      </SectionField>
    </>
  );
};

export default NativeSurveyInputs;
