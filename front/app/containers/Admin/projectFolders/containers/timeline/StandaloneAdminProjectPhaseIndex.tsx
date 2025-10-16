import React, { useState, useEffect } from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Timeline from 'containers/ProjectsShowPage/timeline/Timeline';

import { useIntl } from 'utils/cl-intl';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import { AdminProjectIdeasContent } from '../../../projects/project/ideas';
import { AdminPhaseEdit } from '../../../projects/project/phaseSetup';
import { getTimelineTab } from '../../../projects/project/phaseSetup/utils';
import {
  FeatureFlags,
  getTabs,
  IPhaseTab,
} from '../../../projects/project/tabs';
import { AdminProjectVolunteeringContent } from '../../../projects/project/volunteering';

import { StandalonePhaseHeader } from './StandalonePhaseHeader';

const PlaceholderBox = styled(Box)`
  padding: 40px;
  text-align: center;
  background: ${colors.background};
  border-radius: 4px;
`;

interface DataProps {
  project: IProjectData;
  selectedPhase?: IPhaseData;
  setSelectedPhase: (phase: IPhaseData) => void;
  hideTimeline?: boolean;
}

const StandaloneAdminProjectPhaseIndex = ({
  project,
  selectedPhase,
  setSelectedPhase,
  hideTimeline = false,
}: DataProps) => {
  const { formatMessage } = useIntl();
  const featureFlags: FeatureFlags = {
    typeform_enabled: useFeatureFlag({
      name: 'typeform_surveys',
    }),
    surveys_enabled: useFeatureFlag({
      name: 'surveys',
    }),
    report_builder_enabled: useFeatureFlag({
      name: 'report_builder',
    }),
  };

  const tabs: IPhaseTab[] = selectedPhase
    ? getTabs(selectedPhase, featureFlags, formatMessage)
    : [];

  // Track the active tab locally
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (!selectedPhase) return 'setup';
    return getTimelineTab(selectedPhase);
  });

  // When the selected phase changes, reset to the default tab
  useEffect(() => {
    if (selectedPhase) {
      setActiveTab(getTimelineTab(selectedPhase));
    }
  }, [selectedPhase]);

  const renderTabContent = () => {
    if (!selectedPhase) return null;

    // Render components for each tab type
    switch (activeTab) {
      case 'setup':
        return (
          <AdminPhaseEdit
            projectId={project.id}
            phase={{ data: selectedPhase }}
          />
        );
      case 'access-rights':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Access Rights Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Phase permissions configuration would go here
            </Text>
          </PlaceholderBox>
        );
      case 'emails':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Emails Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Phase email configuration would go here
            </Text>
          </PlaceholderBox>
        );
      case 'survey-results':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Survey Results Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Survey results would go here
            </Text>
          </PlaceholderBox>
        );
      case 'polls':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Polls Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Poll configuration would go here
            </Text>
          </PlaceholderBox>
        );
      case 'ideas':
        return (
          <AdminProjectIdeasContent
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'form':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Input Form Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Input form configuration would go here
            </Text>
          </PlaceholderBox>
        );
      case 'proposals':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Proposals Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Proposals management would go here
            </Text>
          </PlaceholderBox>
        );
      case 'volunteering':
        return (
          <AdminProjectVolunteeringContent
            projectId={project.id}
            phaseId={selectedPhase.id}
          />
        );
      case 'map':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Map Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Map configuration would go here
            </Text>
          </PlaceholderBox>
        );
      case 'results':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Survey Results Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Native survey results would go here
            </Text>
          </PlaceholderBox>
        );
      case 'survey-form':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Survey Form Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Survey form editor would go here
            </Text>
          </PlaceholderBox>
        );
      case 'report':
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Report Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Report builder would go here
            </Text>
          </PlaceholderBox>
        );
      default:
        return (
          <PlaceholderBox>
            <Text color="textSecondary">Tab Content</Text>
            <Text mt="8px" color="textSecondary">
              Content for &ldquo;{activeTab}&rdquo; would go here
            </Text>
          </PlaceholderBox>
        );
    }
  };

  return (
    <>
      {!hideTimeline && (
        <Box mt="16px" px="24px">
          <Timeline
            projectId={project.id}
            selectedPhase={selectedPhase}
            setSelectedPhase={setSelectedPhase}
            isBackoffice
          />
        </Box>
      )}
      <Box p="8px 24px 24px 24px">
        {selectedPhase && (
          <StandalonePhaseHeader
            phase={selectedPhase}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            projectId={project.id}
            onPhaseDelete={() => {
              // Handle phase deletion - could call a callback prop if needed
            }}
          />
        )}

        <Box p={`${defaultAdminCardPadding}px`} background={colors.white}>
          {renderTabContent()}
        </Box>
      </Box>
    </>
  );
};

export { StandaloneAdminProjectPhaseIndex };
