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
    spam_report
    initiating_user
  end

  factory :comment_on_your_comment, parent: :notification, class: 'Notifications::CommentOnYourComment' do
    initiating_user
    comment
    idea
  end

  factory :idea_assigned_to_you, parent: :notification, class: 'Notifications::IdeaAssignedToYou' do
    initiating_user
    idea
  end

  factory :idea_marked_as_spam, parent: :notification, class: 'Notifications::IdeaMarkedAsSpam' do
    idea
    spam_report
    initiating_user
  end

  factory :initiative_assigned_to_you, parent: :notification, class: 'Notifications::InitiaitveAssignedToYou' do
    initiating_user
    initiaitve
  end

  factory :initiative_marked_as_spam, parent: :notification, class: 'Notifications::InitiativeMarkedAsSpam' do
    initiative
    spam_report
    initiating_user
  end

  factory :invite_accepted, parent: :notification, class: 'Notifications::InviteAccepted' do
    initiating_user
    invite
  end

  factory :comment_on_your_idea, parent: :notification, class: 'Notifications::CommentOnYourIdea' do
    initiating_user
    comment
    idea
  end

  factory :comment_on_your_initiative, parent: :notification, class: 'Notifications::CommentOnYourInitiative' do
    initiating_user
    comment
    initiative
  end

  factory :mention_in_comment, parent: :notification, class: 'Notifications::MentionInComment' do
    initiating_user
    comment
    idea
  end

  factory :mention_in_official_feedback, parent: :notification, class: 'Notifications::MentionInOfficialFeedback' do
    initiating_user
    official_feedback
    idea
  end

  factory :new_comment_for_admin, parent: :notification, class: 'Notifications::NewCommentForAdmin' do
    initiating_user
    comment
    idea
  end

  factory :new_idea_for_admin, parent: :notification, class: 'Notifications::NewIdeaForAdmin' do
    initiating_user
    idea
  end

  factory :official_feedback_on_commented_idea, parent: :notification, class: 'Notifications::OfficialFeedbackOnCommentedIdea' do
    initiating_user
    official_feedback
    idea
  end

  factory :official_feedback_on_voted_idea, parent: :notification, class: 'Notifications::OfficialFeedbackOnVotedIdea' do
    initiating_user
    official_feedback
    idea
  end

  factory :official_feedback_on_your_idea, parent: :notification, class: 'Notifications::OfficialFeedbackOnYourIdea' do
    initiating_user
    official_feedback
    idea
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

  factory :status_change_of_your_idea, parent: :notification, class: 'Notifications::StatusChangeOfYourIdea' do
    idea
    idea_status
    before(:create) do |notification|
      notification.idea.idea_status = notification.idea_status
    end
  end

  factory :status_change_on_commented_idea, parent: :notification, class: 'Notifications::StatusChangeOnCommentedIdea' do
    idea
    idea_status
    before(:create) do |notification|
      notification.idea.idea_status = notification.idea_status
    end
  end

  factory :status_change_on_voted_idea, parent: :notification, class: 'Notifications::StatusChangeOnVotedIdea' do
    idea
    idea_status
    before(:create) do |notification|
      notification.idea.idea_status = notification.idea_status
    end
  end
  
end
