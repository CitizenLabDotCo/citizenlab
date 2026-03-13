# frozen_string_literal: true

require 'rails_helper'

describe UserRoleService do
  let(:service) { described_class.new }

  describe 'can_moderate?' do
    it 'for a project folder' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])

      expect(service).to be_can_moderate(folder, create(:project_folder_moderator, project_folders: [folder]))
      expect(service).to be_can_moderate(folder, create(:admin))

      expect(service).not_to be_can_moderate(folder, create(:user))
      expect(service).not_to be_can_moderate(folder, create(:project_folder_moderator))
      expect(service).not_to be_can_moderate(folder, create(:project_moderator, projects: [project]))
    end

    it 'for a project' do
      project = create(:project)

      expect(service).to be_can_moderate(project, create(:admin))
      expect(service).not_to be_can_moderate(project, create(:user))
    end

    it 'for a project in a folder' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])

      expect(service).to be_can_moderate(project, create(:project_moderator, projects: [project]))
      expect(service).to be_can_moderate(project, create(:project_folder_moderator, project_folders: [folder]))
      expect(service).to be_can_moderate(project, create(:admin))

      expect(service).not_to be_can_moderate(project, create(:user))
      expect(service).not_to be_can_moderate(project, create(:project_moderator, projects: [create(:project)]))
      expect(service).not_to be_can_moderate(project, create(:project_folder_moderator, project_folders: [create(:project_folder)]))
    end

    it 'for an idea' do
      project = create(:project)
      idea = create(:idea, project: project)

      expect(service).to be_can_moderate(idea, create(:admin))
      expect(service).to be_can_moderate(idea, create(:project_moderator, projects: [project]))

      expect(service).not_to be_can_moderate(idea, create(:user))
      expect(service).not_to be_can_moderate(idea, create(:project_moderator, projects: [create(:project)]))

      # Idea in project in folder:
      folder = create(:project_folder, projects: [project])

      expect(service).to be_can_moderate(idea, create(:admin))
      expect(service).to be_can_moderate(idea, create(:project_moderator, projects: [project]))
      expect(service).to be_can_moderate(idea, create(:project_folder_moderator, project_folders: [folder]))

      expect(service).not_to be_can_moderate(idea, create(:user))
      expect(service).not_to be_can_moderate(idea, create(:project_moderator, projects: [create(:project)]))
      expect(service).not_to be_can_moderate(idea, create(:project_folder_moderator, project_folders: [create(:project_folder)]))
    end

    it 'for a comment' do
      project = create(:single_phase_proposals_project)
      proposal = create(:proposal, project: project, creation_phase: project.phases.first)
      comment = create(:comment, idea: proposal)

      expect(service).to be_can_moderate(comment, create(:admin))
      expect(service).to be_can_moderate(comment, create(:project_moderator, projects: [project]))

      expect(service).not_to be_can_moderate(comment, create(:user))
      expect(service).not_to be_can_moderate(comment, create(:project_moderator, projects: [create(:project)]))
      expect(service).not_to be_can_moderate(comment, create(:project_folder_moderator))

      # Comment on idea in project in folder:
      folder = create(:project_folder, projects: [project])

      expect(service).to be_can_moderate(comment, create(:admin))
      expect(service).to be_can_moderate(comment, create(:project_moderator, projects: [project]))
      expect(service).to be_can_moderate(comment, create(:project_folder_moderator, project_folders: [folder]))

      expect(service).not_to be_can_moderate(comment, create(:user))
      expect(service).not_to be_can_moderate(comment, create(:project_moderator, projects: [create(:project)]))
      expect(service).not_to be_can_moderate(comment, create(:project_folder_moderator, project_folders: [create(:project_folder)]))
    end
  end

  describe 'can_moderate_project?' do
    let(:project) { create(:project) }
    let(:folder) { create(:project_folder, projects: [create(:project), project]) }

    it 'permits admins' do
      expect(service.can_moderate_project?(project, create(:admin))).to be true
    end

    it 'denies normal users' do
      expect(service.can_moderate_project?(project, create(:user))).to be false
    end

    it 'permits project moderators' do
      expect(service.can_moderate_project?(project, create(:project_moderator, projects: [project]))).to be true
    end

    it 'denies other project moderators' do
      expect(service.can_moderate_project?(project, create(:project_moderator, projects: [create(:project)]))).to be false
    end

    it 'permits folder moderators' do
      expect(service).to be_can_moderate_project(project.reload, create(:project_folder_moderator, project_folders: [folder]))
    end

    it 'denies other folder moderators' do
      expect(service).not_to be_can_moderate_project(project.reload, create(:project_folder_moderator, project_folders: [create(:project_folder)]))
    end
  end

  describe 'moderators_for' do
    it 'lists all moderators of a project folder' do
      project = create(:project)
      folder = create(:project_folder, projects: [project])
      other_folder = create(:project_folder)
      create(:user)
      admin = create(:admin)
      create(:project_moderator, projects: [project])
      folder_moderators = [
        create(:project_folder_moderator, project_folders: [other_folder, folder]),
        create(:project_folder_moderator, project_folders: [other_folder])
      ]

      expect(service.moderators_for(folder).ids).to contain_exactly(admin.id, folder_moderators[0].id)
    end

    it 'lists all moderators of a project' do
      project = create(:project)
      other_project = create(:project)
      folder = create(:project_folder, projects: [project])
      other_folder = create(:project_folder, projects: [other_project])
      create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [project, other_project])
      create(:project_moderator, projects: [other_project])
      folder_moderators = [
        create(:project_folder_moderator, project_folders: [other_folder, folder]),
        create(:project_folder_moderator, project_folders: [other_folder])
      ]

      expect(service.moderators_for(project.reload).ids).to contain_exactly(admin.id, moderator.id, folder_moderators[0].id)
    end

    it 'lists all moderators of an idea' do
      project = create(:project)
      other_project = create(:project)
      create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [other_project, project])
      also_moderator = create(:project_moderator, projects: [project])
      create(:project_moderator, projects: [other_project])
      idea = create(:idea, project: project)

      expect(service.moderators_for(idea).ids).to contain_exactly(admin.id, moderator.id, also_moderator.id)
    end

    it 'lists all moderators of a comment' do
      project = create(:project)
      other_project = create(:project)
      create(:user)
      admin = create(:admin)
      moderator = create(:project_moderator, projects: [other_project, project])
      also_moderator = create(:project_moderator, projects: [project])
      create(:project_moderator, projects: [other_project])
      idea = create(:idea, project: project)
      comment = create(:comment, idea: idea)

      expect(service.moderators_for(comment).ids).to contain_exactly(admin.id, moderator.id, also_moderator.id)
    end
  end

  describe 'moderators_for_project' do
    it 'lists only project and folder moderators and admins' do
      project = create(:project)
      other_project = create(:project)
      folder = create(:project_folder, projects: [project])
      other_folder = create(:project_folder, projects: [other_project])
      create(:user)
      admin = create(:admin)
      moderators = [
        create(:project_moderator, projects: [other_project, project]),
        create(:project_moderator, projects: [project]),
        create(:project_moderator, projects: [other_project])
      ]
      folder_moderators = [
        create(:project_folder_moderator, project_folders: [folder]),
        create(:project_folder_moderator, project_folders: [other_folder])
      ]

      expect(service.moderators_for_project(project.reload).ids).to contain_exactly(admin.id, moderators[0].id, moderators[1].id, folder_moderators[0].id)
    end
  end

  describe 'moderatable_projects' do
    it 'lists no projects for normal users' do
      create_list(:project, 2)

      expect(service.moderatable_projects(create(:user)).ids).to eq []
    end

    it 'lists all projects in the given scope for admins' do
      public_projects = create_list(:project, 3, visible_to: 'public')
      create(:project, visible_to: 'admins')

      expect(
        service.moderatable_projects(create(:admin), Project.where(visible_to: 'public')).ids
      ).to match_array public_projects.map(&:id)

      expect(service.moderatable_projects(create(:admin)).ids).to match_array Project.all.map(&:id)
    end

    it 'lists some projects for project moderators' do
      projects = create_list(:project, 3)
      other_project = create(:project)

      moderator = create(:project_moderator, projects: projects)
      create(:project_moderator, projects: [other_project, projects.first])

      expect(service.moderatable_projects(moderator).ids).to match_array projects.map(&:id)
    end

    it 'lists some projects for project folder moderators' do
      projects = create_list(:project, 3)
      folder1 = create(:project_folder, projects: projects.take(2))
      folder2 = create(:project_folder, projects: [projects.last])
      other_project = create(:project)
      other_folder = create(:project_folder, projects: [other_project])

      moderator = create(:project_folder_moderator, project_folders: [folder2, folder1])
      other_moderator = create(:project_folder_moderator, project_folders: [other_folder])

      expect(service.moderatable_projects(moderator)).to match_array(projects)
      expect(service.moderatable_projects(other_moderator)).to match_array(other_project)
    end

    context 'when the user is both project moderator and admin' do
      let(:projects) { create_list(:project, 2) }
      let(:folder) { create(:project_folder, projects: projects.take(1)) }
      let(:user) { create(:project_folder_moderator, project_folders: [folder]).add_role('admin') }

      it 'lists all projects' do
        expect(service.moderatable_projects(user)).to match_array(projects)
      end
    end

    context 'when the user is both project moderator and folder moderator' do
      let(:projects) { create_list(:project, 2) }
      let(:project_in_folder) { create(:project) }

      let(:folder) { create(:project_folder, projects: [project_in_folder]) }
      let(:user) { create(:project_folder_moderator, project_folders: [folder]).add_role('project_moderator', project_id: projects.last.id) }

      it 'lists all moderatable projects in given scope' do
        expect(service.moderatable_projects(user)).to contain_exactly(projects.last, project_in_folder)

        expect(service.moderatable_projects(user, Project.where(id: [projects.first.id, project_in_folder.id]))).to eq([project_in_folder])
      end
    end
  end

  describe 'moderates_something?' do
    it 'permits admins' do
      expect(service.moderates_something?(create(:admin))).to be true
    end

    it 'denies normal users' do
      expect(service.moderates_something?(create(:user))).to be false
    end

    it 'permits project moderators' do
      expect(service.moderates_something?(create(:project_moderator))).to be true
    end

    it 'permits folders moderators' do
      expect(service.moderates_something?(create(:project_folder_moderator))).to be true
    end
  end

  describe 'moderators_per_project' do
    it 'returns moderators grouped by project ID' do
      p1, p2, p3 = create_list(:project, 3)
      m1 = create(:project_moderator, projects: [p1, p2])
      m2 = create(:project_moderator, projects: [p2])
      create(:project_moderator, projects: [p3])
      m4 = create(:project_moderator, projects: [p3, p2])

      result = service.moderators_per_project([p1.id, p2.id])
      expect(result.keys).to contain_exactly(p1.id, p2.id)
      expect(result[p1.id]).to contain_exactly(m1)
      expect(result[p2.id]).to contain_exactly(m1, m2, m4)
    end

    it 'does not crash if empty array is passed' do
      expect(service.moderators_per_project([])).to eq({})
    end

    it 'does not crash if no moderators exist' do
      p1 = create(:project)
      expect(service.moderators_per_project([p1.id])).to eq({})
    end
  end

  describe 'moderators_per_folder' do
    it 'returns moderators grouped by folder ID' do
      f1, f2, f3, f4 = create_list(:project_folder, 4)
      m1 = create(:project_folder_moderator, project_folders: [f1, f2])
      m2 = create(:project_folder_moderator, project_folders: [f2])
      m3 = create(:project_folder_moderator, project_folders: [f3])
      create(:project_folder_moderator, project_folders: [f4])
      m5 = create(:project_folder_moderator, project_folders: [f4, f3])

      result = service.moderators_per_folder([f1.id, f2.id, f3.id])
      expect(result.keys).to contain_exactly(f1.id, f2.id, f3.id)
      expect(result[f1.id]).to contain_exactly(m1)
      expect(result[f2.id]).to contain_exactly(m1, m2)
      expect(result[f3.id]).to contain_exactly(m3, m5)
    end

    it 'does not crash if empty array is passed' do
      expect(service.moderators_per_project([])).to eq({})
    end

    it 'does not crash if no moderators exist' do
      f1 = create(:project_folder)
      expect(service.moderators_per_folder([f1.id])).to eq({})
    end
  end

  describe 'not_citizenlab_member scope' do
    it 'includes only users that do not have Citizenlab or Govocal emails' do
      create(:user, email: 'someone@citizenlab.co')
      create(:user, email: 'someone@govocal.com')
      create(:user, email: 'someone@should-not-be-excluded.com')
      # Users with email: nil can be created via bulk invite import
      nil_email_user = create(:user)
      nil_email_user.update_column(:email, nil)

      expect(User.not_citizenlab_member.pluck(:email))
        .to include('someone@should-not-be-excluded.com', nil)
      expect(User.not_citizenlab_member.pluck(:email))
        .not_to include('someone@citizenlab.co', 'someone@govocal.com')
    end
  end
end
