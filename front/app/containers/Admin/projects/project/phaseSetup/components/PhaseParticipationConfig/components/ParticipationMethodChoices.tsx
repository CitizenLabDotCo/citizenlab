import React from 'react';

import {
  Box,
  Badge,
  Icon,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../messages';

import commonGroundImage from './assets/common_ground.png';
import documentImage from './assets/document.png';
import ideationImage from './assets/ideation.png';
import informationImage from './assets/information.png';
import proposalsImage from './assets/proposals.png';
import surveyImage from './assets/survey.png';
import volunteeringImage from './assets/volunteering.png';
import votingImage from './assets/voting.png';
import messages2 from './messages';
import ParticipationMethodChoice from './ParticipationMethodChoice';

interface Props {
  isSelected?: (method: ParticipationMethod) => boolean;
  onSelect: (event: React.MouseEvent, method: ParticipationMethod) => void;
  variant?: 'default' | 'bo';
  /** Only these methods, when given. Cards keep their usual order. */
  methods?: readonly ParticipationMethod[];
}

const ParticipationMethodChoices = ({
  isSelected = () => false,
  onSelect,
  variant = 'default',
  methods,
}: Props) => {
  const { formatMessage } = useIntl();
  const shows = (method: ParticipationMethod) =>
    !methods || methods.includes(method);
  const documentAnnotationAllowed = useFeatureFlag({
    name: 'konveio_document_annotation',
    onlyCheckAllowed: true,
  });
  const documentAnnotationEnabled = useFeatureFlag({
    name: 'konveio_document_annotation',
  });
  const commonGroundEnabled = useFeatureFlag({
    name: 'common_ground',
  });

  return (
    <>
      {shows('ideation') && (
        <ParticipationMethodChoice
          key="ideation"
          title={formatMessage(messages2.ideationTitle)}
          subtitle={formatMessage(messages2.ideationDescription)}
          onClick={(event) => onSelect(event, 'ideation')}
          image={ideationImage}
          selected={isSelected('ideation')}
          variant={variant}
          participation_method="ideation"
        />
      )}

      {shows('proposals') && (
        <ParticipationMethodChoice
          key="proposals"
          title={formatMessage(messages2.proposalsTitle)}
          subtitle={formatMessage(messages2.proposalsDescription)}
          onClick={(event) => onSelect(event, 'proposals')}
          image={proposalsImage}
          selected={isSelected('proposals')}
          variant={variant}
          participation_method="proposals"
        />
      )}

      {commonGroundEnabled && shows('common_ground') && (
        <Box position="relative">
          <ParticipationMethodChoice
            key="common_ground"
            title={formatMessage(messages2.commonGroundTitle)}
            subtitle={formatMessage(messages2.commonGroundDescription)}
            onClick={(event) => onSelect(event, 'common_ground')}
            image={commonGroundImage}
            selected={isSelected('common_ground')}
            variant={variant}
            participation_method="common_ground"
          />
          <Box
            style={{ transform: 'translateX(-50%)' }}
            position="absolute"
            top="10%"
            left="50%"
          >
            <Tooltip
              maxWidth="500px"
              placement="bottom"
              content={formatMessage(messages.betaTooltip)}
              hideOnClick={false}
            >
              <Badge color={colors.coolGrey600} className="inverse">
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  gap="6px"
                >
                  {formatMessage(messages.beta)}
                </Box>
              </Badge>
            </Tooltip>
          </Box>
        </Box>
      )}

      {shows('native_survey') && (
        <ParticipationMethodChoice
          key="survey"
          title={formatMessage(messages2.surveyTitle)}
          subtitle={formatMessage(messages2.surveyDescription)}
          onClick={(event) => onSelect(event, 'native_survey')}
          image={surveyImage}
          selected={isSelected('native_survey')}
          variant={variant}
          participation_method="native_survey"
        />
      )}

      {shows('voting') && (
        <ParticipationMethodChoice
          key="voting"
          title={formatMessage(messages2.votingTitle)}
          subtitle={formatMessage(messages2.votingDescription)}
          onClick={(event) => onSelect(event, 'voting')}
          image={votingImage}
          selected={isSelected('voting')}
          variant={variant}
          participation_method="voting"
        />
      )}

      {shows('information') && (
        <ParticipationMethodChoice
          key="information"
          title={formatMessage(messages2.informationTitle)}
          subtitle={formatMessage(messages2.reportingDescription)}
          onClick={(event) => onSelect(event, 'information')}
          image={informationImage}
          selected={isSelected('information')}
          variant={variant}
          participation_method="information"
        />
      )}

      {shows('volunteering') && (
        <ParticipationMethodChoice
          key="volunteering"
          title={formatMessage(messages2.volunteeringTitle)}
          subtitle={formatMessage(messages2.volunteeringDescription)}
          onClick={(event) => onSelect(event, 'volunteering')}
          image={volunteeringImage}
          selected={isSelected('volunteering')}
          variant={variant}
          participation_method="volunteering"
        />
      )}
      {shows('document_annotation') &&
        (documentAnnotationAllowed ? (
          documentAnnotationEnabled && (
            <Box position="relative">
              <ParticipationMethodChoice
                key="document"
                title={formatMessage(messages2.documentTitle)}
                subtitle={formatMessage(messages2.documentDescription)}
                onClick={(event) => {
                  event.preventDefault();
                  onSelect(event, 'document_annotation');
                }}
                image={documentImage}
                selected={isSelected('document_annotation')}
                variant={variant}
                participation_method="document_annotation"
              />
            </Box>
          )
        ) : (
          <Box position="relative">
            <ParticipationMethodChoice
              key="document"
              title={formatMessage(messages2.documentTitle)}
              subtitle={formatMessage(messages2.documentDescription)}
              image={documentImage}
              selected={isSelected('document_annotation')}
              variant={variant}
              participation_method="document_annotation"
              // In the picker the Add-on badge says it all; in a menu of
              // actions the card must also look like it can't be picked.
              disabledReason={
                variant === 'bo'
                  ? formatMessage(messages.contactGovSuccessToAccess)
                  : undefined
              }
            />
            <Box
              style={{ transform: 'translateX(-50%)' }}
              position="absolute"
              top="20%"
              left="50%"
            >
              <Tooltip
                maxWidth="250px"
                placement="bottom"
                content={formatMessage(messages.contactGovSuccessToAccess)}
                hideOnClick={false}
              >
                <Badge color={colors.coolGrey600} className="inverse">
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap="6px"
                  >
                    <Icon name="lock" fill="white" width="13px" />
                    {formatMessage(messages2.addOn)}
                  </Box>
                </Badge>
              </Tooltip>
            </Box>
          </Box>
        ))}
    </>
  );
};

export default ParticipationMethodChoices;
