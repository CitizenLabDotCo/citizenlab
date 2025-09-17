import React, { useState, useEffect, useRef } from 'react';

import {
  Box,
  Button,
  Text,
  defaultStyles,
  useBreakpoint,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import styled, { keyframes, useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import { getInputTerm } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import LanguageSelector from 'containers/MainHeader/Components/LanguageSelector';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from '../../messages';

// Styled components for animations
const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const ScrollIndicatorContainer = styled(Box)`
  animation: ${bounceAnimation} 2s infinite;
`;

const ScrollIcon = styled(Box)`
  animation: ${pulseAnimation} 1.5s infinite;
`;

type PageVariant = 'other' | 'submission' | 'after-submission';

const CY_DATA_VALUES: Record<PageVariant, string> = {
  other: 'e2e-next-page',
  submission: 'e2e-submit-form',
  'after-submission': 'e2e-after-submission',
};

const ICON_VALUES: Record<PageVariant, IconNames | undefined> = {
  other: 'chevron-right',
  submission: 'send',
  'after-submission': undefined,
};

const BUTTON_MESSAGES: Record<PageVariant, MessageDescriptor> = {
  other: messages.next,
  submission: messages.submit,
  'after-submission': messages.backToProject,
};

const inputTermMessages: Record<string, MessageDescriptor> = {
  idea: messages.viewYourIdea,
  option: messages.viewYourOption,
  project: messages.viewYourProject,
  question: messages.viewYourQuestion,
  issue: messages.viewYourIssue,
  contribution: messages.viewYourContribution,
  proposal: messages.viewYourProposal,
  petition: messages.viewYourPetition,
  initiative: messages.viewYourInitiative,
};

interface Props {
  handleNextAndSubmit: () => void;
  handlePrevious: () => void;
  hasPreviousPage: boolean;
  isLoading: boolean;
  pageVariant: PageVariant;
  phases: IPhaseData[] | undefined;
  currentPhase: IPhaseData | undefined;
  pageButtonLabelMultiloc?: Multiloc;
  pageButtonLink?: string;
  project: IProject | undefined;
  pageQuestions?: Array<{ id: string; key: string }>;
  currentPageNumber?: number;
}

const SmartStickyButton = ({
  handleNextAndSubmit,
  handlePrevious,
  hasPreviousPage,
  isLoading,
  pageVariant,
  phases,
  pageButtonLabelMultiloc,
  pageButtonLink,
  currentPhase,
  project,
  pageQuestions = [],
  currentPageNumber,
}: Props) => {
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { data: authUser } = useAuthUser();
  const userCanModerate = project
    ? canModerateProject(project.data, authUser)
    : false;

  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setHasReachedBottom(false);
    setShowScrollIndicator(false);
    setHasScrolled(false);
  }, [currentPageNumber]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasReachedBottom) {
        setShowScrollIndicator(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasReachedBottom]);

  useEffect(() => {
    const enabledQuestions = pageQuestions.filter((q) => q.id && q.key);
    const lastQuestion =
      enabledQuestions.length > 0
        ? enabledQuestions[enabledQuestions.length - 1]
        : undefined;

    if (!lastQuestion) {
      setHasReachedBottom(true);
      setShowScrollIndicator(false);
      return;
    }

    const lastQuestionElement = document.querySelector(
      `[data-question-id="${lastQuestion.id}"]`
    );

    if (!lastQuestionElement) {
      setHasReachedBottom(true);
      setShowScrollIndicator(false);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasReachedBottom(true);
            setShowScrollIndicator(false);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px 0px 0px',
      }
    );

    observerRef.current.observe(lastQuestionElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pageQuestions, currentPageNumber]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled]);

  const getButtonMessage = () => {
    if (pageVariant !== 'after-submission') {
      return formatMessage(BUTTON_MESSAGES[pageVariant]);
    }

    const customLabel = localize(pageButtonLabelMultiloc);
    if (customLabel) {
      return customLabel;
    }

    const participationMethod = currentPhase?.attributes.participation_method;

    if (participationMethod === 'common_ground') {
      // We redirect admins to the input manager to easily manage inputs
      // and users to their own input.
      const messageKey = userCanModerate
        ? messages.backToInputManager
        : messages.viewYourInput;
      return formatMessage(messageKey);
    }

    if (participationMethod === 'native_survey') {
      return formatMessage(messages.backToProject);
    }

    const inputTerm = getInputTerm(phases, currentPhase);
    return formatMessage(inputTermMessages[inputTerm]);
  };

  const isButtonDisabled =
    !hasReachedBottom && pageVariant !== 'after-submission';

  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bgColor={colors.white}
      px={isSmallerThanPhone ? '16px' : '24px'}
      py={'16px'}
      position="relative"
    >
      {showScrollIndicator && (
        <ScrollIndicatorContainer
          position="absolute"
          top="-50px"
          left="50%"
          transform="translateX(-50%)"
          display="flex"
          flexDirection="column"
          alignItems="center"
          role="alert"
          aria-live="polite"
        >
          <Text color="tenantPrimary" fontSize="s" mb="4px" textAlign="center">
            <FormattedMessage {...messages.scrollToContinue} />
          </Text>
          <ScrollIcon color={theme.colors.tenantPrimary} aria-hidden="true">
            <Text fontSize="l">↓</Text>
          </ScrollIcon>
        </ScrollIndicatorContainer>
      )}

      <Box>
        <LanguageSelector
          dropdownClassName={'open-upwards'}
          useDefaultTop={false}
          mobileRight="auto"
          mobileLeft="auto"
          right="auto"
          afterSelection={() => {
            window.location.reload();
          }}
        />
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        {hasPreviousPage && pageVariant !== 'after-submission' && (
          <Button
            onClick={handlePrevious}
            data-cy="e2e-previous-page"
            icon="chevron-left"
            buttonStyle="primary-outlined"
            marginRight={isSmallerThanPhone ? '8px' : '16px'}
          >
            <FormattedMessage {...messages.previous} />
          </Button>
        )}
        {pageButtonLink ? (
          <ButtonWithLink
            data-cy={CY_DATA_VALUES[pageVariant]}
            icon={ICON_VALUES[pageVariant]}
            iconPos="right"
            bgColor={
              isButtonDisabled ? colors.grey300 : theme.colors.tenantPrimary
            }
            boxShadow={defaultStyles.boxShadow}
            processing={isLoading}
            linkTo={pageButtonLink}
            disabled={isButtonDisabled}
            title={
              isButtonDisabled
                ? formatMessage(messages.scrollToContinueTooltip)
                : undefined
            }
          >
            {getButtonMessage()}
          </ButtonWithLink>
        ) : (
          <Button
            onClick={handleNextAndSubmit}
            data-cy={CY_DATA_VALUES[pageVariant]}
            icon={ICON_VALUES[pageVariant]}
            iconPos="right"
            bgColor={
              isButtonDisabled ? colors.grey300 : theme.colors.tenantPrimary
            }
            boxShadow={defaultStyles.boxShadow}
            processing={isLoading}
            disabled={isButtonDisabled}
            title={
              isButtonDisabled
                ? formatMessage(messages.scrollToContinueTooltip)
                : undefined
            }
          >
            {getButtonMessage()}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SmartStickyButton;
