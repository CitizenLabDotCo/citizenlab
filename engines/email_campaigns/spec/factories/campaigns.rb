FactoryBot.define do
  factory :manual_campaign, class: EmailCampaigns::Campaigns::Manual do
    enabled { true }
    author
    sender { "author" }
    reply_to { "someguy@somecity.com" }
    subject_multiloc {{
      "en" => "We're almost done with your feedback"  
    }}
    body_multiloc {{
      "en" => "Time to check it all out!"  
    }}
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

  factory :first_idea_published_campaign, class: EmailCampaigns::Campaigns::FirstIdeaPublished do
    enabled { true }
  end

  factory :idea_assigned_to_you_campaign, class: EmailCampaigns::Campaigns::IdeaAssignedToYou do
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

  factory :new_comment_on_voted_idea_campaign, class: EmailCampaigns::Campaigns::NewCommentOnVotedIdea do
    enabled { true }
  end

  factory :new_comment_on_voted_initiative_campaign, class: EmailCampaigns::Campaigns::NewCommentOnVotedInitiative do
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

  factory :official_feedback_on_voted_idea_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnVotedIdea do
    enabled { true }
  end

  factory :official_feedback_on_voted_initiative_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnVotedInitiative do
    enabled { true }
  end

  factory :official_feedback_on_your_idea_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnYourIdea do
    enabled { true }
  end

  factory :official_feedback_on_your_initiative_campaign, class: EmailCampaigns::Campaigns::OfficialFeedbackOnYourInitiative do
    enabled { true }
  end

  factory :password_reset_campaign, class: EmailCampaigns::Campaigns::PasswordReset do
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

  factory :status_change_of_voted_idea_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfVotedIdea do
    enabled { true }
  end

  factory :status_change_of_voted_initiative_campaign, class: EmailCampaigns::Campaigns::StatusChangeOfVotedInitiative do
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
end

def weekly_schedule
  IceCube::Schedule.new(Time.find_zone('Europe/Brussels').local(2018,8,13,10,0)) do |s|
    s.add_recurrence_rule(
      IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
    )
  end.to_hash
end
