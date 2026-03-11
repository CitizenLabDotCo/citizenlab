# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'single_use:remove_pm_roles_from_fms rake task' do
  before do
    load_rake_tasks_if_not_loaded
  end

  after do
    Rake::Task['single_use:remove_pm_roles_from_fms'].reenable
  end

  let(:folderA) { create(:project_folder) }
  let!(:projectA1) { create(:project, folder: folderA) }
  let!(:projectA2) { create(:project, folder: folderA) }

  let(:folderB) { create(:project_folder) }
  let!(:projectB1) { create(:project, folder: folderB) }

  let!(:projectC) { create(:project) }

  let(:user) do
    create(
      :user,
      roles: [
        { type: 'project_folder_moderator', project_folder_id: folderA.id },
        { type: 'project_moderator', project_id: projectA1.id },
        { type: 'project_moderator', project_id: projectA2.id },
        { type: 'project_moderator', project_id: projectB1.id },
        { type: 'project_moderator', project_id: projectC.id }
      ]
    )
  end

  it 'removes only the expected project moderator roles from folder moderators' do
    expect(user.roles.count).to eq(5)

    Rake::Task['single_use:remove_pm_roles_from_fms'].invoke('execute')

    expect(user.reload.roles.count).to eq(3)

    # The project moderator roles for the projects in the moderated folder should be removed
    expect(user.roles).not_to include({ 'type' => 'project_moderator', 'project_id' => projectA1.id })
    expect(user.roles).not_to include({ 'type' => 'project_moderator', 'project_id' => projectA2.id })

    # The project moderator roles for the projects not in the moderated folder should remain,
    # including the moderated project in a folder the user does not moderate.
    expect(user.roles).to include({ 'type' => 'project_folder_moderator', 'project_folder_id' => folderA.id })
    expect(user.roles).to include({ 'type' => 'project_moderator', 'project_id' => projectB1.id })
    expect(user.roles).to include({ 'type' => 'project_moderator', 'project_id' => projectC.id })
  end
end
