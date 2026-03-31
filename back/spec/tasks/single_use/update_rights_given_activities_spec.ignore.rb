require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:update_rights_given_activities rake task' do
  before do
    load_rake_tasks_if_not_loaded
  end

  after do
    Rake::Task['single_use:update_rights_given_activities'].reenable
  end

  # Should be changed by the task
  let!(:activity1) { create(:activity, action: 'admin_rights_given') }
  let!(:activity2) { create(:activity, action: 'admin_rights_given') }
  let!(:activity3) { create(:activity, action: 'project_moderation_rights_given') }
  let!(:activity4) { create(:activity, action: 'project_folder_moderation_rights_given') }

  # Should not be changed by the task
  let!(:activity5) { create(:activity, action: 'admin_rights_received') }
  let!(:activity6) { create(:activity, action: 'project_moderation_rights_received') }
  let!(:activity7) { create(:activity, action: 'project_folder_moderation_rights_received') }

  it 'updates the action of the relevant activities' do
    Rake::Task['single_use:update_rights_given_activities'].invoke('execute')

    # Changed by the task
    expect(activity1.reload.action).to eq('admin_rights_received')
    expect(activity2.reload.action).to eq('admin_rights_received')
    expect(activity3.reload.action).to eq('project_moderation_rights_received')
    expect(activity4.reload.action).to eq('project_folder_moderation_rights_received')

    # Not changed by the task
    expect(activity5.reload.action).to eq('admin_rights_received')
    expect(activity6.reload.action).to eq('project_moderation_rights_received')
    expect(activity7.reload.action).to eq('project_folder_moderation_rights_received')
  end
end
# rubocop:enable RSpec/DescribeClass
