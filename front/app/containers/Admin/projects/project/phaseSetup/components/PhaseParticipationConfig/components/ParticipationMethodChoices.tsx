import React from 'react';

import {
  Box,
  Badge,
  Icon,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { PressEvent } from 'react-aria-components';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import DsBadge from 'design-system/Badge';
import 'design-system/tokens.css';

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
  onSelect: (
    event: React.MouseEvent | PressEvent,
    method: ParticipationMethod
  ) => void;
  variant?: 'default' | 'panel';
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

  if (variant === 'panel') {
    return (
      <>
        {shows('ideation') && (
          <ParticipationMethodChoice
            variant="panel"
            title={formatMessage(messages2.ideationTitle)}
            subtitle={formatMessage(messages2.ideationDescription)}
            onPress={(event) => onSelect(event, 'ideation')}
            image={ideationImage}
            participation_method="ideation"
          />
        )}
        {shows('proposals') && (
          <ParticipationMethodChoice
            variant="panel"
            title={formatMessage(messages2.proposalsTitle)}
            subtitle={formatMessage(messages2.proposalsDescription)}
            onPress={(event) => onSelect(event, 'proposals')}
            image={proposalsImage}
            participation_method="proposals"
          />
        )}
        {commonGroundEnabled && shows('common_ground') && (
          <ParticipationMethodChoice
            variant="panel"
            title={formatMessage(messages2.commonGroundTitle)}
            subtitle={formatMessage(messages2.commonGroundDescription)}
            onPress={(event) => onSelect(event, 'common_ground')}
            image={commonGroundImage}
            participation_method="common_ground"
            notes={<DsBadge use="note">{formatMessage(messages.beta)}</DsBadge>}
            tooltip={formatMessage(messages.betaTooltip)}
          />
        )}
        {shows('native_survey') && (
          <ParticipationMethodChoice
            variant="panel"
            title={formatMessage(messages2.surveyTitle)}
            subtitle={formatMessage(messages2.surveyDescription)}
            onPress={(event) => onSelect(event, 'native_survey')}
            image={surveyImage}
            participation_method="native_survey"
          />
        )}
        {shows('voting') && (
          <ParticipationMethodChoice
            variant="panel"
            title={formatMessage(messages2.votingTitle)}
            subtitle={formatMessage(messages2.votingDescription)}
            onPress={(event) => onSelect(event, 'voting')}
            image={votingImage}
            participation_method="voting"
          />
        )}
        {shows('information') && (
          <ParticipationMethodChoice
            variant="panel"
            title={formatMessage(messages2.informationTitle)}
            subtitle={formatMessage(messages2.reportingDescription)}
            onPress={(event) => onSelect(event, 'information')}
            image={informationImage}
            participation_method="information"
          />
        )}
        {shows('volunteering') && (
          <ParticipationMethodChoice
            variant="panel"
            title={formatMessage(messages2.volunteeringTitle)}
            subtitle={formatMessage(messages2.volunteeringDescription)}
            onPress={(event) => onSelect(event, 'volunteering')}
            image={volunteeringImage}
            participation_method="volunteering"
          />
        )}
        {shows('document_annotation') &&
          (documentAnnotationAllowed ? (
            documentAnnotationEnabled && (
              <ParticipationMethodChoice
                variant="panel"
                title={formatMessage(messages2.documentTitle)}
                subtitle={formatMessage(messages2.documentDescription)}
                onPress={(event) => onSelect(event, 'document_annotation')}
                image={documentImage}
                participation_method="document_annotation"
              />
            )
          ) : (
            <ParticipationMethodChoice
              variant="panel"
              title={formatMessage(messages2.documentTitle)}
              subtitle={formatMessage(messages2.documentDescription)}
              image={documentImage}
              participation_method="document_annotation"
              notes={
                <DsBadge use="note">{formatMessage(messages2.addOn)}</DsBadge>
              }
              disabledReason={formatMessage(messages.contactGovSuccessToAccess)}
            />
          ))}
      </>
    );
  }

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
              participation_method="document_annotation"
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
