# frozen_string_literal: true

require 'rails_helper'

describe SideFxProjectService do
  include SideFxHelper

  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe 'after_create' do
    it "logs a 'created' action when a project is created" do
      expect { service.after_create(project, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          project,
          'created',
          user,
          project.created_at.to_i,
          project_id: project.id,
          payload: { project: clean_time_attributes(project.attributes) }
        )
    end

    it "logs a 'published' action when a published project is created" do
      expect { service.after_create(project, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(project, 'published', user, project.updated_at.to_i, anything)
    end

    it "does not log a 'published' action when a draft project is created" do
      project.admin_publication.update!(publication_status: 'draft')

      expect { service.after_create(project, user) }
        .not_to have_enqueued_job(LogActivityJob)
        .with(project, 'published', user, project.updated_at.to_i, anything)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the project has changed" do
      service.before_update(project, user)
      project.update!(title_multiloc: { en: 'changed' })
      expect { service.after_update(project, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          project,
          'changed',
          user,
          project.updated_at.to_i,
          project_id: project.id,
          payload: {
            change: { 'title_multiloc' => [build(:project).title_multiloc, { 'en' => 'changed' }] },
            project: clean_time_attributes(project.attributes)
          }
        )
    end

    it "logs a 'published' action when a draft project is published" do
      project.admin_publication.update!(publication_status: 'draft')

      project.assign_attributes(admin_publication_attributes: { publication_status: 'published' })
      service.before_update(project, user)

      project.save!

      expect { service.after_update(project, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(project, 'published', user, project.updated_at.to_i, project_id: project.id)
        .and have_enqueued_job(LogActivityJob)
        .with(
          project,
          'changed',
          user,
          project.updated_at.to_i,
          project_id: project.id,
          payload: {
            change: { 'publication_status' => %w[draft published] },
            project: clean_time_attributes(project.attributes)
          }
        )
    end

    it "does not log a 'published' action when a archived project is republished" do
      project.admin_publication.update!(publication_status: 'archived')

      project.assign_attributes(admin_publication_attributes: { publication_status: 'published' })
      service.before_update project, user

      expect { service.after_update(project, user) }
        .not_to have_enqueued_job(LogActivityJob)
        .with(project, 'published', user, project.updated_at.to_i, anything)
    end

    it 'enqueues the transition job when a schedule is set' do
      scheduled_at = 1.day.from_now
      project.assign_attributes(
        admin_publication_attributes: { scheduled_status: 'archived', scheduled_at: scheduled_at }
      )
      service.before_update(project, user)
      project.save!

      expect { service.after_update(project, user) }
        .to have_enqueued_job(ProcessScheduledPublicationTransitionJob)
        .with(project.admin_publication.id)
    end

    it 'does not enqueue the transition job when no schedule is set' do
      project.assign_attributes(title_multiloc: { en: 'changed' })
      service.before_update(project, user)
      project.save!

      expect { service.after_update(project, user) }
        .not_to have_enqueued_job(ProcessScheduledPublicationTransitionJob)
    end

    it 'materializes a due transition before the update without infinite loop' do
      project.admin_publication.update_columns(
        publication_status: 'draft', scheduled_status: 'published',
        scheduled_at: 1.hour.ago, scheduled_by_id: user.id
      )
      project.admin_publication.reload
      project.assign_attributes(title_multiloc: { en: 'changed' })

      service.before_update(project, user)

      project.admin_publication.reload
      expect(project.admin_publication.read_attribute(:publication_status)).to eq('published')
      expect(project.admin_publication.scheduled_status).to be_nil
    end
  end

  describe 'before_destroy' do
    it 'materializes a due transition before destroy' do
      project.admin_publication.update_columns(
        publication_status: 'draft', scheduled_status: 'published',
        scheduled_at: 1.hour.ago, scheduled_by_id: user.id
      )
      project.admin_publication.reload

      service.before_destroy(project, user)

      project.admin_publication.reload
      expect(project.admin_publication.read_attribute(:publication_status)).to eq('published')
      expect(project.admin_publication.first_published_at).to be_present
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the project is destroyed" do
      freeze_time do
        frozen_project = project.destroy
        expect { service.after_destroy(frozen_project, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end

    it 'invokes ContentBuilder::LayoutService#clean_homepage_layout_when_publication_deleted' do
      layout_service = instance_double(ContentBuilder::LayoutService)
      allow(ContentBuilder::LayoutService).to receive(:new).and_return(layout_service)
      expect(layout_service).to receive(:clean_homepage_layout_when_publication_deleted).with(instance_of(Project))

      frozen_project = project.destroy
      service.after_destroy(frozen_project, user)
    end
  end

  describe 'after_delete_inputs' do
    it 'logs "inputs_deleted" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        project,
        'inputs_deleted',
        user,
        anything
      )
      service.after_delete_inputs project, user
    end
  end

  describe 'after_votes_by_user_xlsx' do
    it 'logs "exported_votes_by_user" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        project,
        'exported_votes_by_user',
        user,
        anything,
        project_id: project.id
      )
      service.after_votes_by_user_xlsx project, user
    end
  end

  describe 'after_votes_by_input_xlsx' do
    it 'logs "exported_votes_by_input" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        project,
        'exported_votes_by_input',
        user,
        anything,
        project_id: project.id
      )
      service.after_votes_by_input_xlsx project, user
    end
  end

  describe 'after_copy' do
    let(:source_project) { create(:project) }
    let(:copied_project) { create(:project, default_assignee: nil) }

    it 'logs "local_copy_created" activity' do
      expect(LogActivityJob).to receive(:perform_later).with(
        copied_project,
        'local_copy_created',
        user,
        copied_project.created_at.to_i,
        payload: {
          time_taken: anything,
          source_project_id: source_project.id,
          copied_project_attributes: copied_project.attributes
        }
      )
      service.after_copy(source_project, copied_project, user, Time.now)
    end

    it 'assigns current user as default_assignee, and moderator of new copied project if needed' do
      moderator = create(:project_moderator, projects: [source_project])

      service.after_copy(source_project, copied_project, moderator, Time.now)

      expect(copied_project.default_assignee).to eq(moderator)
      expect(UserRoleService.new.can_moderate?(copied_project, moderator.reload)).to be true
    end

    it 'does not set current user as moderator of new copied project if not needed' do
      user = create(:admin)

      service.after_copy(source_project, copied_project, user, Time.now)

      expect(copied_project.default_assignee).to eq(user)
      expect(UserRoleService.new.can_moderate?(copied_project, user)).to be true
    end
  end
end
