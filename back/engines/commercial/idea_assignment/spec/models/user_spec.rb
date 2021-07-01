# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'clean_assignments callback' do
    context 'when user loses admin rights' do
      let(:user) { create(:admin) }

      it 'removes all assigned ideas' do
        idea = create(:idea, assignee: user)
        expect { user.update(roles: []) }.to change { idea.reload.assignee }.from(user).to(nil)
      end

      it 'clears all default_assigned_projects' do
        project = create(:project, default_assignee: user)
        expect { user.update(roles: []) }.to change { project.reload.default_assignee }.from(user).to(nil)
      end
    end

    context 'when project moderator loses admin rights' do
      let(:user) do
        create(:project_moderator).tap do |user|
          user.roles << { type: 'admin' }
          user.save!
        end
      end

      it 'unassigns ideas from non-moderated projects' do
        idea = create(:idea, assignee: user)
        new_roles = user.roles.reject { |r| r['type'] == 'admin' }
        expect { user.update(roles: new_roles) }.to change { idea.reload.assignee }.from(user).to(nil)
      end

      it 'keeps assigned ideas from moderated projects' do
        idea = create(:idea, assignee: user, project: user.moderatable_projects.first)
        new_roles = user.roles.reject { |r| r['type'] == 'admin' }
        user.update(roles: new_roles)
        expect(idea.reload.assignee).to eq(user)
      end
    end

    # rubocop:disable RSpec/MultipleMemoizedHelpers
    context 'when user loses project-moderator rights' do
      # Basically, we have here a user that moderates two projects.
      # Each project has one idea which is assigned to the user.
      let(:idea_p1) { create(:idea) }
      let(:idea_p2) { create(:idea) }
      let(:project1) { idea_p1.project }
      let(:project2) { idea_p2.project }
      let(:user) do
        build(:user) do |u|
          u.roles = [
            { type: 'project_moderator', project_id: project1.id },
            { type: 'project_moderator', project_id: project2.id }
          ]
          u.save
        end
      end
      let(:new_roles) { user.roles.reject { |r| r['project_id'] == idea_p1.project.id } }

      before do
        idea_p1.assignee = user
        idea_p1.save
        idea_p2.assignee = user
        idea_p2.save
      end

      it 'unassigns ideas from the newly non-moderated project' do
        expect { user.update(roles: new_roles) }.to change { idea_p1.reload.assignee }.from(user).to(nil)
      end

      it 'do not unassign ideas from unrelated projects' do
        user.update(roles: new_roles)
        expect(idea_p2.reload.assignee).to eq(user)
      end

      # rubocop:disable RSpec/MultipleExpectations
      it 'clears the corresponding default_assigned_project if necessary' do
        project1.update!(default_assignee: user)
        project2.update!(default_assignee: user)

        expect { user.update(roles: new_roles) }
          .to change { project1.reload.default_assignee }.from(user).to(nil)
        expect(project2.reload.default_assignee).to eq(user)
      end
      # rubocop:enable RSpec/MultipleExpectations
    end
    # rubocop:enable RSpec/MultipleMemoizedHelpers
  end
end
