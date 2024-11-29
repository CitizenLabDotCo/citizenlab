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

    it "removes the folder's admin_publication ID from homepage layout craftJSON" do
      project_folder2 = create(:project_folder)
      project = create(:project)

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
                project_folder2.admin_publication.id,
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
                project_folder.admin_publication.id
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

      frozen_folder = project_folder.destroy
      service.after_destroy(frozen_folder, user)

      expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
        .to match_array [project.admin_publication.id, project_folder2.admin_publication.id]
      expect(layout.reload.craftjs_json['x08l42oNsD']['props']['adminPublicationIds'])
        .to eq([project.admin_publication.id])
    end

    it "removes the specified folder's children's admin_publication IDs from homepage layout craftJSON" do
      project1 = create(:project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id })
      project2 = create(:project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id })

      project_folder2 = create(:project_folder)
      project3 = create(:project, admin_publication_attributes: { parent_id: project_folder2.admin_publication.id })

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
                project_folder.admin_publication.id,
                project1.admin_publication.id,
                project2.admin_publication.id,
                project_folder2.admin_publication.id,
                project3.admin_publication.id
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

      children_ids = project_folder.admin_publication.children.pluck(:id)
      frozen_folder = project_folder.destroy
      service.after_destroy(frozen_folder, user, children_ids)

      expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
        .to match_array [project_folder2.admin_publication.id, project3.admin_publication.id]
    end
  end
end
