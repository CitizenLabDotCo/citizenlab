import React, { useState, useEffect } from 'react';

import { IconTooltip, Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';
import FeatureCallout from 'components/UI/FeatureCallout';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../../../messages';

import messages2 from './messages';
import ParticipationMethodChoices from './ParticipationMethodChoices';
import SurveyMethodChoices from './SurveyMethodChoices';

interface Props {
  participation_method: ParticipationMethod;
  showSurveys: boolean;
  apiErrors: CLErrors | null | undefined;
  handleParticipationMethodOnChange: (
    participation_method: ParticipationMethod
  ) => void;
}

const ParticipationMethodPicker = ({
  participation_method,
  showSurveys,
  apiErrors,
  handleParticipationMethodOnChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const [selectedMethod, setSelectedMethod] =
    useState<ParticipationMethod | null>(participation_method);
  const [showSurveyOptions, setShowSurveyOptions] = useState(
    participation_method === 'native_survey' ||
      participation_method === 'survey' ||
      participation_method === 'poll'
  );
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });

  useEffect(() => {
    setSelectedMethod(participation_method);
    setShowSurveyOptions(
      participation_method === 'native_survey' ||
        participation_method === 'survey' ||
        participation_method === 'poll'
    );
  }, [participation_method]);

  const handleMethodSelect = (event, method: ParticipationMethod) => {
    event.preventDefault();

    if (selectedMethod === method) {
      return;
    }

    const isSurveyCategory = ['native_survey', 'survey', 'poll'].includes(
      method
    );
    setShowSurveyOptions(isSurveyCategory);
    setSelectedMethod(method);
    handleParticipationMethodOnChange(method);
  };

  return (
    <>
      <SectionField>
        <SubSectionTitle className="intercom-admin-participation-method-picker-heading">
          <FormattedMessage {...messages.participationMethodTitleText} />
          <IconTooltip
            content={
              <FormattedMessage {...messages.participationMethodTooltip} />
            }
          />
        </SubSectionTitle>
        <>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            <ParticipationMethodChoices
              isSelected={(method) =>
                method === 'native_survey'
                  ? showSurveyOptions
                  : selectedMethod === method
              }
              onSelect={handleMethodSelect}
            />

            {showSurveyOptions && (
              <>
                <Box style={{ gridColumn: '1 / span 3' }}>
                  <SubSectionTitle>
                    {formatMessage(messages2.surveyOptions)}
                  </SubSectionTitle>
                </Box>

                <SurveyMethodChoices
                  selected={selectedMethod ?? participation_method}
                  showExternalSurvey={showSurveys}
                  onSelect={handleMethodSelect}
                />
              </>
            )}
          </Box>
          {selectedMethod &&
            ['native_survey', 'ideation', 'proposals'].includes(
              selectedMethod
            ) && (
              <Box mt="24px" width="750px">
                <FeatureCallout
                  icon={importPrintedFormsEnabled ? 'form-sync' : 'lock'}
                  disabledTooltipContent={
                    <Box display="flex" flexDirection="column" gap="8px">
                      <FormattedMessage {...messages2.formSyncLockedTooltip} />
                      <FormattedMessage {...messages2.formSyncLockedTooltip2} />
                    </Box>
                  }
                  tooltipDisabled={importPrintedFormsEnabled}
                  linkTo="https://support.govocal.com/en/articles/527575-bulk-import-ideas-surveys-via-formsync"
                  linkText={<FormattedMessage {...messages2.learnMore} />}
                  title={
                    <FormattedMessage {...messages2.collectResponsesOnPaper} />
                  }
                  description={
                    <>
                      <FormattedMessage
                        {...messages2.collectResponsesOnPaperDescription}
                      />{' '}
                      {!importPrintedFormsEnabled && (
                        <FormattedMessage
                          {...messages2.notAvailableInYourPlan}
                        />
                      )}
                    </>
                  }
                />
              </Box>
            )}
          <Error apiErrors={apiErrors && apiErrors.participation_method} />
        </>
      </SectionField>
    </>
  );
};

export default ParticipationMethodPicker;
