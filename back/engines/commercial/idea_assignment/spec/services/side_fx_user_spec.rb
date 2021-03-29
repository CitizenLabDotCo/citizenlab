require 'rails_helper'

describe SideFxUserService do
  let(:service) { SideFxUserService.new }
  let(:current_user) { create(:user) }
  let(:user) { create(:user) }

  describe 'after_update' do
    it 'unassigns all assigned ideas if the user no longer is admin' do
      user = create(:admin)
      idea = create(:idea, assignee: user)
      user.update(roles: [])
      expect { service.after_update(user, current_user) }.to change { idea.reload.assignee }.from(user).to(nil)
    end

    it 'unassigns all default_assigned_projects if the user no longer is admin' do
      user = create(:admin)
      project = create(:project, default_assignee: user)
      user.update(roles: [])
      expect { service.after_update(user, current_user) }.to change {
                                                               project.reload.default_assignee
                                                             }.from(user).to(nil)
    end

    it 'unassigns all assigned ideas of the project the user is no longer moderator of' do
      project1 = create(:project)
      project2 = create(:project)
      user = create(:user, roles: [
                      { 'type' => 'project_moderator', 'project_id' => project1.id },
                      { 'type' => 'project_moderator', 'project_id' => project2.id }
                    ])
      idea1 = create(:idea, project: project1, assignee: user)
      idea2 = create(:idea, project: project2, assignee: user)
      user.update(roles: [{ 'type' => 'project_moderator', 'project_id' => project1.id }])
      expect { service.after_update(user, current_user) }.to change { idea2.reload.assignee }.from(user).to(nil)
      expect(idea1.reload.assignee).to eq user
    end

    it 'unassigns all default_assigned_projects the user is no longer moderator of' do
      project1 = create(:project)
      project2 = create(:project)
      user = create(:user, roles: [
                      { 'type' => 'project_moderator', 'project_id' => project1.id },
                      { 'type' => 'project_moderator', 'project_id' => project2.id }
                    ])
      project1.update!(default_assignee: user)
      project2.update!(default_assignee: user)
      user.update(roles: [{ 'type' => 'project_moderator', 'project_id' => project1.id }])
      expect { service.after_update(user, current_user) }.to change {
                                                               project2.reload.default_assignee
                                                             }.from(user).to(nil)
      expect(project1.reload.default_assignee).to eq user
    end
  end
end
