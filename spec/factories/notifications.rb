FactoryGirl.define do

  factory :notification, class: 'Notification' do
    read_at nil
    recipient
  end

  factory :comment_on_your_comment, parent: :notification, class: 'Notifications::CommentOnYourComment' do
    initiating_user
    comment
    idea
  end
end
