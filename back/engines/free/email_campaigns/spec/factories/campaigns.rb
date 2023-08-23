# frozen_string_literal: true

FactoryBot.define do
  factory :manual_campaign, class: EmailCampaigns::Campaigns::Manual do
    enabled { true }
    author
    sender { 'author' }
    reply_to { 'someguy@somecity.com' }
    subject_multiloc do
      {
        'en' => "We're almost done with your feedback"
      }
    end
    body_multiloc do
      {
        'en' => 'Time to check it all out!'
      }
    end
  end

  factory :admin_rights_received_campaign, class: EmailCampaigns::Campaigns::AdminRightsReceived do
    enabled { true }
  end

  factory :comment_deleted_by_admin_campaign, class: EmailCampaigns::Campaigns::CommentDeletedByAdmin do
    enabled { true }
  end

  factory :comment_marked_as_spam_campaign, class: EmailCampaigns::Campaigns::CommentMarkedAsSpam do
    enabled { true }
  end

  factory :comment_on_your_comment_campaign, class: EmailCampaigns::Campaigns::CommentOnYourComment do
    enabled { true }
  end

  factory :comment_on_your_idea_campaign, class: EmailCampaigns::Campaigns::CommentOnYourIdea do
    enabled { true }
  end

  factory :comment_on_your_initiative_campaign, class: EmailCampaigns::Campaigns::CommentOnYourInitiative do
    enabled { true }
  end

  factory :cosponsor_of_your_initiative_campaign, class: EmailCampaigns::Campaigns::CosponsorOfYourInitiative do
    enabled { true }
  end

  factory :idea_marked_as_spam_campaign, class: EmailCampaigns::Campaigns::IdeaMarkedAsSpam do
    enabled { true }
  end

  factory :idea_published_campaign, class: EmailCampaigns::Campaigns::IdeaPublished do
    enabled { true }
  end

  factory :invite_received_campaign, class: EmailCampaigns::Campaigns::InviteReceived do
    enabled { true }
  end

  factory :invite_reminder_campaign, class: EmailCampaigns::Campaigns::InviteReminder do
    enabled { true }
  end

  factory :initiative_assigned_to_you_campaign, class: EmailCampaigns::Campaigns::InitiativeAssignedToYou do
    enabled { true }
  end

  factory :initiative_marked_as_spam_campaign, class: EmailCampaigns::Campaigns::InitiativeMarkedAsSpam do
    enabled { true }
  end

  factory :initiative_published_campaign, class: EmailCampaigns::Campaigns::InitiativePublished do
    enabled { true }
  end

  factory :initiative_resubmitted_for_review_campaign, class: EmailCampaigns::Campaigns::InitiativeResubmittedForReview do
    enabled { true }
  end

  factory :internal_comment_on_idea_assigned_to_you_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnIdeaAssignedToYou do
    enabled { true }
  end

  factory :internal_comment_on_idea_you_commented_internally_on_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnIdeaYouCommentedInternallyOn do
    enabled { true }
  end

  factory :internal_comment_on_idea_you_moderate_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnIdeaYouModerate do
    enabled { true }
  end

  factory :internal_comment_on_initiative_assigned_to_you_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnInitiativeAssignedToYou do
    enabled { true }
  end

  factory :internal_comment_on_initiative_you_commented_internally_on_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnInitiativeYouCommentedInternallyOn do
    enabled { true }
  end

  factory :internal_comment_on_unassigned_initiative_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnUnassignedInitiative do
    enabled { true }
  end

  factory :internal_comment_on_unassigned_unmoderated_idea_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnUnassignedUnmoderatedIdea do
    enabled { true }
  end

  factory :internal_comment_on_your_internal_comment_campaign, class: EmailCampaigns::Campaigns::InternalCommentOnYourInternalComment do
    enabled { true }
  end

  factory :invitation_to_cosponsor_initiative_campaign, class: EmailCampaigns::Campaigns::InvitationToCosponsorInitiative do
    enabled { true }
  end

  factory :mention_in_internal_comment_campaign, class: EmailCampaigns::Campaigns::MentionInInternalComment do
    enabled { true }
  end

  factory :mention_in_official_feedback_campaign, class: EmailCampaigns::Campaigns::MentionInOfficialFeedback do
    enabled { true }
  end

  factory :new_comment_for_admin_campaign, class: EmailCampaigns::Campaigns::NewCommentForAdmin do
    enabled { true }
  end

  factory :new_comment_on_commented_idea_campaign, class: EmailCampaigns::Campaigns::NewCommentOnCommentedIdea do
    enabled { true }
  end

  factory :new_comment_on_commented_initiative_campaign, class: EmailCampaigns::Campaigns::NewCommentOnCommentedInitiative do
    enabled { true }
  end

  factory :new_comment_on_reacted_idea_campaign, class: EmailCampaigns::Campaigns::NewCommentOnReactedIdea do
    enabled { true }
  end

  factory :new_comment_on_reacted_initiative_campaign, class: EmailCampaigns::Campaigns::NewCommentOnReactedInitiative do
    enabled { true }
  end

  factory :new_idea_for_admin_campaign, class: EmailCampaigns::Campaigns::NewIdeaForAdmin do
    enabled { true }
  end

  factory :new_initiative_for_admin_campaign, class: EmailCampaigns::Campaigns::NewInitiativeForAdmin do
    enabled { true }
  end

  factory :official_feedback_on_commented_idea_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnCommentedIdea do
    enabled { true }
  end

  factory :official_feedback_on_commented_initiative_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnCommentedInitiative do
    enabled { true }
  end

  factory :official_feedback_on_reacted_idea_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnReactedIdea do
    enabled { true }
  end

  factory :official_feedback_on_reacted_initiative_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnReactedInitiative do
    enabled { true }
  end

  factory :official_feedback_on_your_idea_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnYourIdea do
    enabled { true }
  end

  factory :official_feedback_on_your_initiative_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnYourInitiative do
    enabled { true }
  end

  factory :project_folder_moderation_rights_received_campaign, class: EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived do
    enabled { true }
  end

  factory :project_moderation_rights_received_campaign, class: EmailCampaigns::Campaigns::ProjectModerationRightsReceived do
    enabled { true }
  end

  factory :project_phase_started_campaign, class: EmailCampaigns::Campaigns::ProjectPhaseStarted do
    enabled { true }
  end

  factory :project_phase_upcoming_campaign, class: EmailCampaigns::Campaigns::ProjectPhaseUpcoming do
    enabled { true }
  end

  factory :status_change_of_commented_idea_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfCommentedIdea do
    enabled { true }
  end

  factory :status_change_of_commented_initiative_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfCommentedInitiative do
    enabled { true }
  end

  factory :status_change_of_reacted_idea_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfReactedIdea do
    enabled { true }
  end

  factory :status_change_of_reacted_initiative_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfReactedInitiative do
    enabled { true }
  end

  factory :status_change_of_your_idea_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfYourIdea do
    enabled { true }
  end

  factory :status_change_of_your_initiative_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfYourInitiative do
    enabled { true }
  end

  factory :threshold_reached_for_admin_campaign, class: EmailCampaigns::Campaigns::ThresholdReachedForAdmin do
    enabled { true }
  end

  factory :welcome_campaign, class: EmailCampaigns::Campaigns::Welcome do
    enabled { true }
  end

  factory :admin_digest_campaign, class: EmailCampaigns::Campaigns::AdminDigest do
    enabled { true }
    schedule { weekly_schedule }
  end

  factory :moderator_digest_campaign, class: EmailCampaigns::Campaigns::ModeratorDigest do
    enabled { true }
    schedule { weekly_schedule }
  end

  factory :assignee_digest_campaign, class: EmailCampaigns::Campaigns::AssigneeDigest do
    enabled { true }
    schedule { weekly_schedule }
  end

  factory :user_digest_campaign, class: EmailCampaigns::Campaigns::UserDigest do
    enabled { true }
    schedule { weekly_schedule }
  end

  factory :your_proposed_initiatives_digest_campaign, class: EmailCampaigns::Campaigns::YourProposedInitiativesDigest do
    enabled { true }
    schedule { weekly_schedule }
  end

  factory :voting_basket_submitted_campaign, class: EmailCampaigns::Campaigns::VotingBasketSubmitted do
    enabled { true }
  end

  factory :voting_basket_not_submitted_campaign, class: EmailCampaigns::Campaigns::VotingBasketNotSubmitted do
    enabled { true }
  end

  factory :voting_last_chance_campaign, class: EmailCampaigns::Campaigns::VotingLastChance do
    enabled { true }
  end

  factory :voting_phase_started_campaign, class: EmailCampaigns::Campaigns::VotingPhaseStarted do
    enabled { true }
  end
end

def weekly_schedule
  IceCube::Schedule.new(Time.find_zone('Europe/Brussels').local(2018, 8, 13, 10, 0)) do |s|
    s.add_recurrence_rule(
      IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
    )
  end.to_hash
end
