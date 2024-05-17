# frozen_string_literal: true

require 'rails_helper'

describe SideFxProjectService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:project) { create(:project) }

  describe 'after_create' do
    it "logs a 'created' action when a project is created" do
      expect { service.after_create(project, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(project, 'created', user, project.created_at.to_i, project_id: project.id)
    end

    it 'runs the description through the text image service' do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images_multiloc).with(project.description_multiloc, field: :description_multiloc, imageable: project).and_return(project.description_multiloc)
      service.after_create(project, user)
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

  describe 'before_update' do
    it 'runs the description through the text image service' do
      expect_any_instance_of(TextImageService).to receive(:swap_data_images_multiloc).with(project.description_multiloc, field: :description_multiloc, imageable: project).and_return(project.description_multiloc)
      service.before_update(project, user)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the project has changed" do
      project.update!(title_multiloc: { en: 'changed' })
      expect { service.after_update(project, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          project,
          'changed',
          user,
          project.updated_at.to_i,
          project_id: project.id,
          payload: { change: project.saved_changes }
        )
    end

    it "logs a 'published' action when a draft project is published" do
      project.admin_publication.update!(publication_status: 'draft')

      project.assign_attributes(admin_publication_attributes: { publication_status: 'published' })
      service.before_update project, user

      project.save!

      expect { service.after_update(project, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(project, 'published', user, project.updated_at.to_i, anything)
    end

    it "does not log a 'published' action when a archived project is republished" do
      project.admin_publication.update!(publication_status: 'archived')

      project.assign_attributes(admin_publication_attributes: { publication_status: 'published' })
      service.before_update project, user

      expect { service.after_update(project, user) }
        .not_to have_enqueued_job(LogActivityJob)
        .with(project, 'published', user, project.updated_at.to_i, anything)
    end

    it "does not log a 'changed_publication_status' action when a draft project is published" do
      project.admin_publication.update!(publication_status: 'draft')

      project.assign_attributes(admin_publication_attributes: { publication_status: 'published' })
      service.before_update project, user

      project.save!

      expect { service.after_update(project, user) }
        .not_to have_enqueued_job(LogActivityJob)
        .with(project, 'changed_publication_status', user, project.updated_at.to_i, anything)
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

    it "logs an UpdateActivityJob for every 'created' or 'changed' activity for the project when project destroyed" do
      create(:activity, item: project, action: 'created')
      create(:activity, item: project, action: 'changed')
      create(:activity, item: project, action: 'changed')
      create(:activity, item: project, action: 'published')
      create(:activity, item: project, action: 'local_copy_created')

      freeze_time do
        frozen_project = project.destroy
        expect { service.after_destroy(frozen_project, user) }
          .to enqueue_job(UpdateActivityJob).exactly(3).times
      end
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
end
