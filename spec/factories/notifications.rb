FactoryGirl.define do
  factory :notification, class: 'Notification' do
    read_at nil
    recipient
  end

  factory :comment_on_your_comment, parent: :notification, class: 'Notifications::CommentOnYourComment' do
    user
    comment
    idea
  end
end
