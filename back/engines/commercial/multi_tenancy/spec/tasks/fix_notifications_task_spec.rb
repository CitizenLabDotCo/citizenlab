require 'rails_helper'

describe 'fix_existing_tenants:remove_deprecated_notifications rake task' do
  before { load_rake_tasks_if_not_loaded }

  after { Rake::Task['fix_existing_tenants:remove_deprecated_notifications'].reenable }

  it 'deletes notifications for deprecated types' do
    create_list(:comment_on_idea_you_follow, 2)
    deprecated = create_list(:comment_on_your_comment, 2).first
    deprecated.update_columns(type: 'Notifications::InitiativeAssignedToYou')

    expect { Rake::Task['fix_existing_tenants:remove_deprecated_notifications'].invoke }.to change(Notification, :count).by(-1)
    expect(Notification.distinct.pluck(:type)).to contain_exactly('Notifications::CommentOnIdeaYouFollow', 'Notifications::CommentOnYourComment')
  end
end
