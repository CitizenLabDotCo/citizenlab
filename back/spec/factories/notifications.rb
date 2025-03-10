# frozen_string_literal: true

FactoryBot.define do
  factory :notification, class: 'Notification' do
    read_at { nil }
    recipient
  end

  factory :admin_rights_received, parent: :notification, class: 'Notifications::AdminRightsReceived' do
    initiating_user
  end

  factory :comment_deleted_by_admin, parent: :notification, class: 'Notifications::CommentDeletedByAdmin' do
    comment
    idea
    initiating_user
    reason_code { 'irrelevant' }
    other_reason { nil }
  end

  factory :comment_marked_as_spam, parent: :notification, class: 'Notifications::CommentMarkedAsSpam' do
    comment
    idea
    spam_report
    initiating_user
  end

  factory :comment_on_your_comment, parent: :notification, class: 'Notifications::CommentOnYourComment' do
    initiating_user
    comment
    idea
  end

  factory :cosponsor_of_your_idea, parent: :notification, class: 'Notifications::CosponsorOfYourIdea' do
    idea
    cosponsorship
    initiating_user
  end

  factory :internal_comment_on_idea_assigned_to_you,
    parent: :notification,
    class: 'Notifications::InternalComments::InternalCommentOnIdeaAssignedToYou' do
    initiating_user
    internal_comment
    idea
  end

  factory :internal_comment_on_idea_you_commented_internally_on,
    parent: :notification,
    class: 'Notifications::InternalComments::InternalCommentOnIdeaYouCommentedInternallyOn' do
    initiating_user
    internal_comment
    idea
  end

  factory :internal_comment_on_idea_you_moderate,
    parent: :notification,
    class: 'Notifications::InternalComments::InternalCommentOnIdeaYouModerate' do
    initiating_user
    internal_comment
    idea
  end

  factory :internal_comment_on_unassigned_unmoderated_idea,
    parent: :notification,
    class: 'Notifications::InternalComments::InternalCommentOnUnassignedUnmoderatedIdea' do
    initiating_user
    internal_comment
    idea
  end

  factory :internal_comment_on_your_internal_comment,
    parent: :notification,
    class: 'Notifications::InternalComments::InternalCommentOnYourInternalComment' do
    initiating_user
    internal_comment
    idea
  end

  factory :idea_marked_as_spam, parent: :notification, class: 'Notifications::IdeaMarkedAsSpam' do
    idea
    project
    spam_report
    initiating_user
  end

  factory :invite_accepted, parent: :notification, class: 'Notifications::InviteAccepted' do
    initiating_user
    invite
  end

  factory :invitation_to_cosponsor_idea, parent: :notification, class: 'Notifications::InvitationToCosponsorIdea' do
    idea
    cosponsorship
    initiating_user
  end

  factory :comment_on_idea_you_follow, parent: :notification, class: 'Notifications::CommentOnIdeaYouFollow' do
    initiating_user
    comment
    idea
    project
  end

  factory :mention_in_comment, parent: :notification, class: 'Notifications::MentionInComment' do
    initiating_user
    comment
    idea
  end

  factory :mention_in_internal_comment, parent: :notification, class: 'Notifications::InternalComments::MentionInInternalComment' do
    initiating_user
    internal_comment
    idea
  end

  factory :mention_in_official_feedback, parent: :notification, class: 'Notifications::MentionInOfficialFeedback' do
    initiating_user
    official_feedback
    idea
  end

  factory :official_feedback_on_idea_you_follow, parent: :notification, class: 'Notifications::OfficialFeedbackOnIdeaYouFollow' do
    initiating_user
    official_feedback
    idea
    project
  end

  factory :project_folder_moderation_rights_received, parent: :notification, class: 'Notifications::ProjectFolderModerationRightsReceived' do
    initiating_user
    project_folder
  end

  factory :project_moderation_rights_received, parent: :notification, class: 'Notifications::ProjectModerationRightsReceived' do
    initiating_user
    project
  end

  factory :project_phase_started, parent: :notification, class: 'Notifications::ProjectPhaseStarted' do
    project
    phase
  end

  factory :project_phase_upcoming, parent: :notification, class: 'Notifications::ProjectPhaseUpcoming' do
    project
    phase
  end

  factory :project_published, parent: :notification, class: 'Notifications::ProjectPublished' do
    initiating_user
    project
  end

  factory :project_review_request, parent: :notification, class: 'Notifications::ProjectReviewRequest' do
    initiating_user
    project_review
    recipient factory: :admin
  end

  factory :project_review_state_change, parent: :notification, class: 'Notifications::ProjectReviewStateChange' do
    initiating_user
    project_review
  end

  factory :status_change_on_idea_you_follow, parent: :notification, class: 'Notifications::StatusChangeOnIdeaYouFollow' do
    idea
    project
    idea_status
    before(:create) do |notification|
      notification.idea.idea_status = notification.idea_status
    end
  end

  factory :threshold_reached_for_admin, parent: :notification, class: 'Notifications::ThresholdReachedForAdmin' do
    idea
    idea_status
  end

  factory :native_survey_not_submitted, parent: :notification, class: 'Notifications::NativeSurveyNotSubmitted' do
    idea
    project
    phase
  end

  factory :voting_basket_submitted, parent: :notification, class: 'Notifications::VotingBasketSubmitted' do
    project
    basket
  end

  factory :voting_basket_not_submitted, parent: :notification, class: 'Notifications::VotingBasketNotSubmitted' do
    project
    phase
    basket
  end

  factory :voting_last_chance, parent: :notification, class: 'Notifications::VotingLastChance' do
    project
    phase
  end

  factory :voting_results_published, parent: :notification, class: 'Notifications::VotingResultsPublished' do
    project
    phase
  end
end
