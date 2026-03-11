# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:add_pm_roles_to_fms rake task' do
  before do
    load_rake_tasks_if_not_loaded
  end

  after do
    Rake::Task['single_use:add_pm_roles_to_fms'].reenable
  end

  let(:folder_a) { create(:project_folder) }
  let!(:project_a1) { create(:project, folder: folder_a) }
  let!(:project_a2) { create(:project, folder: folder_a) }

  let(:folder_b) { create(:project_folder) }
  let!(:project_b1) { create(:project, folder: folder_b) }

  let!(:project_c) { create(:project) }

  let(:user) do
    create(
      :user,
      roles: [
        { type: 'project_folder_moderator', project_folder_id: folder_a.id },
        { type: 'project_moderator', project_id: project_b1.id },
        { type: 'project_moderator', project_id: project_c.id }
      ]
    )
  end

  it 'adds only the expected project moderator roles to folder moderators' do
    expect(user.roles.count).to eq(3)

    Rake::Task['single_use:add_pm_roles_to_fms'].invoke('execute')

    expect(user.reload.roles.count).to eq(5)

    # The project moderator roles for the projects in the moderated folder should be added
    expect(user.roles).to include({ 'type' => 'project_moderator', 'project_id' => project_a1.id })
    expect(user.roles).to include({ 'type' => 'project_moderator', 'project_id' => project_a2.id })

    # The existing roles should remain unchanged
    expect(user.roles).to include({ 'type' => 'project_folder_moderator', 'project_folder_id' => folder_a.id })
    expect(user.roles).to include({ 'type' => 'project_moderator', 'project_id' => project_b1.id })
    expect(user.roles).to include({ 'type' => 'project_moderator', 'project_id' => project_c.id })
  end
end
# rubocop:enable RSpec/DescribeClass
