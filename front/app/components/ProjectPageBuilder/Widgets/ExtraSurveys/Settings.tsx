import React from 'react';

import {
  Box,
  ButtonStyles,
  Label,
  Radio,
  Select,
  Text,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import usePhases from 'api/phases/usePhases';

import useLocalize from 'hooks/useLocalize';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';
import useWidgetProjectId from '../useWidgetProjectId';

import {
  ExtraSurveysProps,
  SurveyButtonFormat,
  isExtraSurveyPhase,
} from './utils';

const Settings = () => {
  const {
    actions: { setProp },
    surveyPhaseId,
    buttonFormat,
    buttonStyle,
    buttonText,
  } = useNode((node) => ({
    surveyPhaseId: node.data.props.surveyPhaseId as string | undefined,
    buttonFormat: (node.data.props.buttonFormat ??
      'card') as SurveyButtonFormat,
    buttonStyle: (node.data.props.buttonStyle ?? 'primary') as ButtonStyles,
    buttonText: node.data.props.buttonText as Multiloc | undefined,
  }));

  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const projectId = useWidgetProjectId();
  const { data: phases } = usePhases(projectId, 'standalone');

  const surveyOptions = (phases?.data ?? [])
    .filter(isExtraSurveyPhase)
    .map((phase) => ({
      value: phase.id,
      label: localize(phase.attributes.title_multiloc),
    }));

  const projectEditorLink = projectId ? (
    <Link
      to="/admin/projects/$projectId/project-page"
      params={{ projectId }}
      target="_blank"
    >
      <FormattedMessage {...messages.projectEditorLinkText} />
    </Link>
  ) : (
    <FormattedMessage {...messages.projectEditorLinkText} />
  );

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="16px">
      <Text m="0px" color="textSecondary" fontSize="s">
        <FormattedMessage
          {...messages.extraSurveysManagedNote}
          values={{ projectEditorLink }}
        />
      </Text>
      <Select
        id="e2e-extra-surveys-survey-select"
        label={formatMessage(messages.extraSurveysSurveyLabel)}
        placeholder={formatMessage(messages.extraSurveysSelectPlaceholder)}
        options={surveyOptions}
        value={surveyPhaseId}
        onChange={(option) => {
          setProp(
            (props: ExtraSurveysProps) =>
              (props.surveyPhaseId = option.value as string | undefined)
          );
        }}
      />
      <Box>
        <Label>
          <FormattedMessage {...messages.extraSurveysFormatLabel} />
        </Label>
        <Radio
          onChange={(value: SurveyButtonFormat) => {
            setProp((props: ExtraSurveysProps) => (props.buttonFormat = value));
          }}
          currentValue={buttonFormat}
          id="extra-surveys-format-button"
          name="extraSurveysButtonFormat"
          value="button"
          label={<FormattedMessage {...messages.extraSurveysFormatButton} />}
          isRequired
        />
        <Radio
          onChange={(value: SurveyButtonFormat) => {
            setProp((props: ExtraSurveysProps) => (props.buttonFormat = value));
          }}
          currentValue={buttonFormat}
          id="extra-surveys-format-card"
          name="extraSurveysButtonFormat"
          value="card"
          label={<FormattedMessage {...messages.extraSurveysFormatCard} />}
          isRequired
        />
      </Box>
      <Box>
        <Label>
          <FormattedMessage {...messages.extraSurveysStyleLabel} />
        </Label>
        <Radio
          onChange={(value: ButtonStyles) => {
            setProp((props: ExtraSurveysProps) => (props.buttonStyle = value));
          }}
          currentValue={buttonStyle}
          id="extra-surveys-style-primary"
          name="extraSurveysButtonStyle"
          value="primary"
          label={<FormattedMessage {...messages.extraSurveysStylePrimary} />}
          isRequired
        />
        <Radio
          onChange={(value: ButtonStyles) => {
            setProp((props: ExtraSurveysProps) => (props.buttonStyle = value));
          }}
          currentValue={buttonStyle}
          id="extra-surveys-style-secondary"
          name="extraSurveysButtonStyle"
          value="secondary-outlined"
          label={<FormattedMessage {...messages.extraSurveysStyleSecondary} />}
          isRequired
        />
      </Box>
      <InputMultilocWithLocaleSwitcher
        id="e2e-extra-surveys-button-text"
        label={formatMessage(messages.extraSurveysButtonTextLabel)}
        placeholder={formatMessage(messages.extraSurveysDefaultButtonText)}
        type="text"
        valueMultiloc={buttonText}
        onChange={(value) => {
          setProp((props: ExtraSurveysProps) => (props.buttonText = value));
        }}
      />
    </Box>
  );
};

export default Settings;
