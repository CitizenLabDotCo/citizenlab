FactoryBot.define do

  factory :notification, class: 'Notification' do
    read_at nil
    recipient
  end

  factory :comment_on_your_comment, parent: :notification, class: 'Notifications::CommentOnYourComment' do
    initiating_user
    comment
    idea
  end

  factory :comment_on_your_idea, parent: :notification, class: 'Notifications::CommentOnYourIdea' do
    initiating_user
    comment
    idea
  end

  factory :mention_in_comment, parent: :notification, class: 'Notifications::MentionInComment' do
    initiating_user
    comment
    idea
  end

  factory :comment_marked_as_spam, parent: :notification, class: 'Notifications::CommentMarkedAsSpam' do
    comment
  end

  factory :idea_marked_as_spam, parent: :notification, class: 'Notifications::IdeaMarkedAsSpam' do
    idea
  end

  factory :status_change_of_your_idea, parent: :notification, class: 'Notifications::StatusChangeOfYourIdea' do
    idea
    idea_status
  end

  factory :comment_deleted_by_admin, parent: :notification, class: 'Notifications::CommentDeletedByAdmin' do
    comment
    idea
    initiating_user
    reason_code 'irrelevant'
    other_reason nil
  end

  factory :invite_accepted, parent: :notification, class: 'Notifications::InviteAccepted' do
    initiating_user
    invite
  end

  factory :project_moderation_rights_received, parent: :notification, class: 'Notifications::ProjectModerationRightsReceived' do
    initiating_user
    project
  end
end
