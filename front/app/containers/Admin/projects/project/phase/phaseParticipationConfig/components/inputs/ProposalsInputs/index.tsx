import React from 'react';

import { IOption } from '@citizenlab/cl2-component-library';

import { IdeaDefaultSortMethod, InputTerm } from 'api/phases/types';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';

import { ApiErrors } from '../../..';
import CustomFieldPicker from '../../shared/CustomFieldPicker';
import DefaultViewPicker from '../../shared/DefaultViewPicker';
import SortingPicker from '../_shared/SortingPicker';
import UserActions from '../_shared/UserActions';

interface Props {
  input_term: InputTerm | undefined;
  handleInputTermChange: (option: IOption) => void;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  reacting_enabled?: boolean | null;
  reacting_like_method: 'unlimited' | 'limited' | null | undefined;
  reacting_like_limited_max: number | null | undefined;
  allow_anonymous_participation: boolean | null | undefined;
  noLikingLimitError: JSX.Element | null;
  apiErrors: ApiErrors;
  togglePostingEnabled: () => void;
  toggleCommentingEnabled: () => void;
  toggleReactingEnabled: () => void;
  handleReactingLikeMethodOnChange: (
    reacting_like_method: 'unlimited' | 'limited'
  ) => void;
  handleLikingLimitOnChange: (reacting_like_limited_max: string) => void;
  handleAllowAnonymousParticipationOnChange: (
    allow_anonymous_participation: boolean
  ) => void;
  presentation_mode: 'card' | 'map' | null | undefined;
  handleIdeasDisplayChange: (presentation_mode: 'map' | 'card') => void;
  ideas_order: IdeaDefaultSortMethod | undefined;
  handleIdeaDefaultSortMethodChange: (
    ideas_order: IdeaDefaultSortMethod
  ) => void;
}

const ProposalsInputs = ({
  input_term,
  handleInputTermChange,
  posting_enabled,
  commenting_enabled,
  reacting_enabled,
  reacting_like_method,
  allow_anonymous_participation,
  reacting_like_limited_max,
  noLikingLimitError,
  apiErrors,
  togglePostingEnabled,
  toggleCommentingEnabled,
  toggleReactingEnabled,
  handleReactingLikeMethodOnChange,
  handleLikingLimitOnChange,
  handleAllowAnonymousParticipationOnChange,
  presentation_mode,
  handleIdeasDisplayChange,
  ideas_order,
  handleIdeaDefaultSortMethodChange,
}: Props) => {
  return (
    <>
      <AnonymousPostingToggle
        allow_anonymous_participation={allow_anonymous_participation}
        handleAllowAnonymousParticipationOnChange={
          handleAllowAnonymousParticipationOnChange
        }
      />
      <CustomFieldPicker
        input_term={input_term}
        handleInputTermChange={handleInputTermChange}
      />

      <UserActions
        posting_enabled={posting_enabled || false}
        commenting_enabled={commenting_enabled || false}
        reacting_enabled={reacting_enabled || false}
        togglePostingEnabled={togglePostingEnabled}
        toggleCommentingEnabled={toggleCommentingEnabled}
        toggleReactingEnabled={toggleReactingEnabled}
        apiErrors={apiErrors}
        reacting_like_method={reacting_like_method}
        reacting_like_limited_max={reacting_like_limited_max}
        noLikingLimitError={noLikingLimitError}
        handleReactingLikeMethodOnChange={handleReactingLikeMethodOnChange}
        handleLikingLimitOnChange={handleLikingLimitOnChange}
      />

      <DefaultViewPicker
        presentation_mode={presentation_mode}
        apiErrors={apiErrors}
        handleIdeasDisplayChange={handleIdeasDisplayChange}
      />

      <SortingPicker
        options={[
          { key: 'trending', value: 'trending' },
          { key: 'random', value: 'random' },
          { key: 'popular', value: 'popular' },
          { key: 'newest', value: 'new' },
          { key: 'oldest', value: '-new' },
        ]}
        ideas_order={ideas_order}
        apiErrors={apiErrors}
        handleIdeaDefaultSortMethodChange={handleIdeaDefaultSortMethodChange}
      />
    </>
  );
};

export default ProposalsInputs;
