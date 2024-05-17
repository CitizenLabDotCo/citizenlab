# frozen_string_literal: true

require 'rails_helper'

describe ProjectFolders::SideFxProjectFolderService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:project_folder) { create(:project_folder, title_multiloc: { en: 'original title' }) }

  describe 'after_create' do
    it "logs a 'created' action when a project is created" do
      expect { service.after_create(project_folder, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(project_folder, 'created', user, project_folder.created_at.to_i)
    end
  end

  describe 'before_update' do
    it 'runs the description through the text image service' do
      expect_any_instance_of(TextImageService)
        .to receive(:swap_data_images_multiloc)
        .with(project_folder.description_multiloc, field: :description_multiloc, imageable: project_folder)
        .and_return(project_folder.description_multiloc)
      service.before_update(project_folder, user)
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the folder has changed" do
      old_title_multiloc = project_folder.title_multiloc
      old_updated_at = project_folder.updated_at

      project_folder.update!(title_multiloc: { en: 'something else' })
      expect { service.after_update(project_folder, user) }
        .to enqueue_job(LogActivityJob).with(
          project_folder,
          'changed',
          user,
          project_folder.updated_at.to_i,
          payload: {
            change: {
              title_multiloc: [old_title_multiloc, { en: 'something else' }],
              updated_at: [old_updated_at, project_folder.updated_at]
            }
          }
        ).exactly(1).times
    end
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the idea is destroyed" do
      freeze_time do
        frozen_project_folder = project_folder.destroy
        expect { service.after_destroy(frozen_project_folder, user) }
          .to enqueue_job(LogActivityJob).exactly(1).times
      end
    end

    it "logs an UpdateActivityJob for every 'created' or 'changed' activity for the folder when folder is destroyed" do
      create(:activity, item: project_folder, action: 'created')
      create(:activity, item: project_folder, action: 'changed')
      create(:activity, item: project_folder, action: 'changed')
      create(:activity, item: project_folder, action: 'another_action')

      freeze_time do
        frozen_project_folder = project_folder.destroy
        expect { service.after_destroy(frozen_project_folder, user) }
          .to enqueue_job(UpdateActivityJob).exactly(3).times
      end
    end
  end
end
