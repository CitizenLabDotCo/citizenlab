import React, { useState, useEffect, useRef } from 'react';

import {
  Box,
  Button,
  defaultStyles,
  useBreakpoint,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import { getInputTerm } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import LanguageSelector from 'containers/MainHeader/Components/LanguageSelector';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import messages from '../messages';

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
  comment: messages.viewYourComment,
  response: messages.viewYourResponse,
  suggestion: messages.viewYourSuggestion,
  topic: messages.viewYourTopic,
  post: messages.viewYourPost,
  story: messages.viewYourStory,
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
  pageQuestions?: IFlatCustomField[];
  currentPageIndex?: number;
}

const PageControlButtons = ({
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
  currentPageIndex,
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
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setHasReachedBottom(false);
  }, [currentPageIndex]);

  useEffect(() => {
    const enabledQuestions = pageQuestions.filter((q) => q.id && q.key);
    const lastQuestion =
      enabledQuestions.length > 0
        ? enabledQuestions[enabledQuestions.length - 1]
        : undefined;

    if (!lastQuestion) {
      setHasReachedBottom(true);
      return;
    }

    const lastQuestionElement = document.querySelector(
      `[data-question-id="${lastQuestion.id}"]`
    );

    if (!lastQuestionElement) {
      setHasReachedBottom(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasReachedBottom(true);
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
  }, [pageQuestions, currentPageIndex]);

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
    >
      <Box>
        {/* We wrap it in a Box here to maintain the spacing and keep the next buttons right-aligned when the language selector is empty, preventing the need to move the locale check logic here. */}
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
            bgColor={theme.colors.tenantPrimary}
            boxShadow={defaultStyles.boxShadow}
            processing={isLoading}
            linkTo={pageButtonLink}
            disabled={isButtonDisabled}
          >
            {getButtonMessage()}
          </ButtonWithLink>
        ) : (
          <Button
            onClick={handleNextAndSubmit}
            data-cy={CY_DATA_VALUES[pageVariant]}
            icon={ICON_VALUES[pageVariant]}
            iconPos="right"
            bgColor={theme.colors.tenantPrimary}
            boxShadow={defaultStyles.boxShadow}
            processing={isLoading}
            disabled={isButtonDisabled}
          >
            {getButtonMessage()}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageControlButtons;
