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
          payload: {
            change: sanitize_change(project.saved_changes),
            project: clean_time_attributes(project.attributes)
          }
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
  end

  describe 'after_destroy' do
    it "logs a 'deleted' action job when the project is destroyed" do
      freeze_time do
        frozen_project = project.destroy
        expect { service.after_destroy(frozen_project, user) }
          .to have_enqueued_job(LogActivityJob)
      end
    end

    it "removes the project's admin_publication ID from homepage layout craftJSON" do
      project2 = create(:project)
      project_folder = create(:project_folder)

      layout = create(
        :homepage_layout,
        craftjs_json: {
          ROOT: {
            type: 'div',
            nodes: %w[
              nUOW77iNcW
            ],
            props: {
              id: 'e2e-content-builder-frame'
            },
            custom: {},
            hidden: false,
            isCanvas: true,
            displayName: 'div',
            linkedNodes: {}
          },
          nUOW77iNcW: {
            type: {
              resolvedName: 'Selection'
            },
            nodes: [],
            props: {
              titleMultiloc: {
                en: 'Projects and folders',
                'fr-BE': 'Projects and folders',
                'nl-BE': 'Projects and folders'
              },
              adminPublicationIds: [
                project2.admin_publication.id,
                project.admin_publication.id,
                project_folder.admin_publication.id
              ]
            },
            custom: {},
            hidden: false,
            parent: 'ROOT',
            isCanvas: false,
            displayName: 'Selection',
            linkedNodes: {}
          },
          PROJECTS: {
            type: {
              resolvedName: 'Projects'
            },
            nodes: [],
            props: {
              currentlyWorkingOnText: {
                en: '',
                'fr-BE': '',
                'nl-BE': ''
              }
            },
            custom: {
              title: {
                id: 'app.containers.Admin.pagesAndMenu.containers.ContentBuilder.components.CraftComponents.Projects.projectsTitle',
                defaultMessage: 'Projects'
              },
              noDelete: true,
              noPointerEvents: true
            },
            hidden: false,
            parent: 'ROOT',
            isCanvas: false,
            displayName: 'Projects',
            linkedNodes: {}
          },
          x08l42oNsD: {
            type: {
              resolvedName: 'Selection'
            },
            nodes: [],
            props: {
              titleMultiloc: {
                en: 'Projects and folders',
                'fr-BE': 'Projects and folders',
                'nl-BE': 'Projects and folders'
              },
              adminPublicationIds: [
                project.admin_publication.id,
                project2.admin_publication.id
              ]
            },
            custom: {},
            hidden: false,
            parent: 'ROOT',
            isCanvas: false,
            displayName: 'Selection',
            linkedNodes: {}
          }
        }
      )

      frozen_project = project.destroy
      service.after_destroy(frozen_project, user)

      expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
        .to match_array [project_folder.admin_publication.id, project2.admin_publication.id]
      expect(layout.reload.craftjs_json['x08l42oNsD']['props']['adminPublicationIds'])
        .to eq([project2.admin_publication.id])
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
end
