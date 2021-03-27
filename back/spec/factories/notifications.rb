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
    association :post, factory: :idea
    initiating_user
    reason_code { 'irrelevant' }
    other_reason { nil }
  end

  factory :comment_marked_as_spam, parent: :notification, class: 'Notifications::CommentMarkedAsSpam' do
    comment
    association :post, factory: :idea
    spam_report
    initiating_user
  end

  factory :comment_on_your_comment, parent: :notification, class: 'Notifications::CommentOnYourComment' do
    initiating_user
    comment
    association :post, factory: :idea
  end

  factory :idea_marked_as_spam, parent: :notification, class: 'Notifications::IdeaMarkedAsSpam' do
    association :post, factory: :idea
    project
    spam_report
    initiating_user
  end

  factory :initiative_assigned_to_you, parent: :notification, class: 'Notifications::InitiativeAssignedToYou' do
    initiating_user
    association :post, factory: :initiative
  end

  factory :initiative_marked_as_spam, parent: :notification, class: 'Notifications::InitiativeMarkedAsSpam' do
    association :post, factory: :initiative
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
    association :post, factory: :idea
    project
  end

  factory :comment_on_your_initiative, parent: :notification, class: 'Notifications::CommentOnYourInitiative' do
    initiating_user
    comment
    association :post, factory: :initiative
  end

  factory :mention_in_comment, parent: :notification, class: 'Notifications::MentionInComment' do
    initiating_user
    comment
    association :post, factory: :idea
  end

  factory :mention_in_official_feedback, parent: :notification, class: 'Notifications::MentionInOfficialFeedback' do
    initiating_user
    official_feedback
    association :post, factory: :idea
  end

  factory :official_feedback_on_commented_idea, parent: :notification, class: 'Notifications::OfficialFeedbackOnCommentedIdea' do
    initiating_user
    official_feedback
    association :post, factory: :idea
    project
  end

  factory :official_feedback_on_commented_initiative, parent: :notification, class: 'Notifications::OfficialFeedbackOnCommentedInitiative' do
    initiating_user
    official_feedback
    association :post, factory: :initiative
  end

  factory :official_feedback_on_voted_idea, parent: :notification, class: 'Notifications::OfficialFeedbackOnVotedIdea' do
    initiating_user
    official_feedback
    association :post, factory: :idea
    project
  end

  factory :official_feedback_on_voted_initiative, parent: :notification, class: 'Notifications::OfficialFeedbackOnVotedInitiative' do
    initiating_user
    official_feedback
    association :post, factory: :initiative
  end

  factory :official_feedback_on_your_idea, parent: :notification, class: 'Notifications::OfficialFeedbackOnYourIdea' do
    initiating_user
    official_feedback
    association :post, factory: :idea
    project
  end

  factory :official_feedback_on_your_initiative, parent: :notification, class: 'Notifications::OfficialFeedbackOnYourInitiative' do
    initiating_user
    official_feedback
    association :post, factory: :initiative
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

  factory :status_change_on_commented_idea, parent: :notification, class: 'Notifications::StatusChangeOnCommentedIdea' do
    association :post, factory: :idea
    project
    association :post_status, factory: :idea_status
    before(:create) do |notification|
      notification.post.idea_status = notification.post_status
    end
  end

  factory :status_change_on_commented_initiative, parent: :notification, class: 'Notifications::StatusChangeOnCommentedInitiative' do
    association :post, factory: :initiative
    association :post_status, factory: :initiative_status
    before(:create) do |notification|
      notification.post.initiative_status_changes.create!(initiative_status: notification.post_status)
    end
  end

  factory :status_change_on_voted_idea, parent: :notification, class: 'Notifications::StatusChangeOnVotedIdea' do
    association :post, factory: :idea
    project
    association :post_status, factory: :idea_status
    before(:create) do |notification|
      notification.post.idea_status = notification.post_status
    end
  end

  factory :status_change_on_voted_initiative, parent: :notification, class: 'Notifications::StatusChangeOnVotedInitiative' do
    association :post, factory: :initiative
    association :post_status, factory: :initiative_status
    before(:create) do |notification|
      notification.post.initiative_status_changes.create!(initiative_status: notification.post_status)
    end
  end

  factory :status_change_of_your_idea, parent: :notification, class: 'Notifications::StatusChangeOfYourIdea' do
    association :post, factory: :idea
    project
    association :post_status, factory: :idea_status
    before(:create) do |notification|
      notification.post.idea_status = notification.post_status
    end
  end

  factory :status_change_of_your_initiative, parent: :notification, class: 'Notifications::StatusChangeOfYourInitiative' do
    association :post, factory: :initiative
    association :post_status, factory: :initiative_status
    before(:create) do |notification|
      notification.post.initiative_status_changes.create!(initiative_status: notification.post_status)
    end
  end

  factory :threshold_reached_for_admin, parent: :notification, class: 'Notifications::ThresholdReachedForAdmin' do
    association :post, factory: :initiative
    association :post_status, factory: :initiative_status
    before(:create) do |notification|
      notification.post.initiative_status_changes.create!(initiative_status: notification.post_status)
    end
  end

end
