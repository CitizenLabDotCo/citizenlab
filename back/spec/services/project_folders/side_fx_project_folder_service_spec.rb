# frozen_string_literal: true

require 'rails_helper'

describe ProjectFolders::SideFxProjectFolderService do
  include SideFxHelper

  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:project_folder) { create(:project_folder, title_multiloc: { en: 'original title' }) }

  describe 'after_create' do
    it "logs a 'created' action when a project is created" do
      expect { service.after_create(project_folder, user) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          project_folder,
          'created',
          user,
          project_folder.created_at.to_i,
          payload: { project_folder: clean_time_attributes(project_folder.attributes) }
        )
    end
  end

  describe 'after_update' do
    it "logs a 'changed' action job when the folder has changed" do
      old_title_multiloc = project_folder.title_multiloc

      project_folder.update!(title_multiloc: { en: 'something else' })
      expect { service.after_update(project_folder, user) }
        .to enqueue_job(LogActivityJob).with(
          project_folder,
          'changed',
          user,
          project_folder.updated_at.to_i,
          payload: {
            change: { title_multiloc: [old_title_multiloc, { en: 'something else' }] },
            project_folder: clean_time_attributes(project_folder.attributes)
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

    it 'invokes ContentBuilder::LayoutService#clean_homepage_layout_when_publication_deleted' do
      layout_service = instance_double(ContentBuilder::LayoutService)
      allow(ContentBuilder::LayoutService).to receive(:new).and_return(layout_service)
      expect(layout_service).to receive(
        :clean_homepage_layout_when_publication_deleted
      ).with(instance_of(ProjectFolders::Folder))

      frozen_folder = project_folder.destroy
      service.after_destroy(frozen_folder, user)
    end
  end
end
