require 'rails_helper'

describe IdeaAssignment::IdeaAssignmentService do
  let(:service) { described_class.new }

  describe 'clean_idea_assignees_for_user!', if: (defined?(ProjectManagement::Engine) && defined?(ProjectFolders::Engine)) do
    it 'clears the assignee where they no longer moderate the ideas' do
      assignee = create :admin
      folder1 = create :project_folder
      folder2 = create :project_folder
      project1 = create :project, folder: folder1
      project2 = create :project, folder: folder2
      project3 = create :project, folder: folder2
      project4 = create :project
      idea1 = create :idea, project: project1, assignee: assignee
      idea2 = create :idea, project: project2, assignee: assignee
      idea3 = create :idea, project: project3, assignee: assignee
      idea4 = create :idea, project: project4, assignee: assignee
      idea5 = create :idea, assignee: create(:admin)
      assignee.update!(roles: [
        { 'type' => 'project_folder_moderator', 'project_folder_id' => folder1.id },
        { 'type' => 'project_moderator', 'project_id' => project2.id }
      ])

      service.clean_idea_assignees_for_user! assignee

      expect(idea1.reload.assignee_id).to eq assignee.id
      expect(idea2.reload.assignee_id).to eq assignee.id
      expect(idea3.reload.assignee_id).to be_blank
      expect(idea4.reload.assignee_id).to be_blank
      expect(idea5.reload.assignee_id).to be_present
    end
  end

  describe 'clean_assignees_for_project!', if: (defined?(ProjectManagement::Engine) && defined?(ProjectFolders::Engine)) do
    it 'clears the assignee where they no longer moderate the ideas' do
      folder = create :project_folder
      project = create :project, folder: folder
      idea1, idea2, idea3, idea4 = create_list(:idea, 4, project: project).each do |idea|
        idea.update! assignee: create(:admin)
      end
      idea5 = create :idea, assignee: create(:admin)
      idea1.assignee.update!(roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id }])
      idea2.assignee.update!(roles: [{ 'type' => 'project_moderator', 'project_id' => project.id }])
      idea3.assignee.update!(roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => create(:project_folder).id }])
      idea4.assignee.update!(roles: [{ 'type' => 'project_moderator', 'project_id' => create(:project).id }])

      service.clean_assignees_for_project! project

      expect(idea1.reload.assignee_id).to be_present
      expect(idea2.reload.assignee_id).to be_present
      expect(idea3.reload.assignee_id).to be_blank
      expect(idea4.reload.assignee_id).to be_blank
      expect(idea5.reload.assignee_id).to be_present
    end
  end
end
