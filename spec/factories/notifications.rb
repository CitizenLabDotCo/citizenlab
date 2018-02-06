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

  factory :comment_marked_as_spam, parent: :notification, class: 'Notifications::CommentMarkedAsSpam' do
    comment
  end

  factory :idea_marked_as_spam, parent: :notification, class: 'Notifications::IdeaMarkedAsSpam' do
    idea
  end
end
