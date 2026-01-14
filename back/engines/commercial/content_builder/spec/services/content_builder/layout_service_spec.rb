# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutService do
  let(:service) { described_class.new }

  describe 'select_craftjs_elements_for_types' do
    it 'can deal with different combinations of hash structures' do
      content = {
        'elt1' => 'string element',
        'elt2' => { 'type' => { 'resolvedName' => 'ImageMultiloc' }, 'props' => 'elt2-props' },
        'elt3' => { 'type' => 'div', 'props' => 'elt3-props' },
        'elt4' => { 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt4-props' }
      }
      images = service.select_craftjs_elements_for_types content, %w[Image ImageMultiloc]
      expect(images).to eq [
        { 'type' => { 'resolvedName' => 'ImageMultiloc' }, 'props' => 'elt2-props' },
        { 'type' => { 'resolvedName' => 'Image' }, 'props' => 'elt4-props' }
      ]
    end
  end

  describe 'delete_admin_publication_id_from_homepage_layout' do
    let(:project1) { create(:project) }
    let(:project2) { create(:project) }
    let(:project_folder) { create(:project_folder) }

    let(:craftjs) do
      {
        ROOT: {
          type: 'div',
          nodes: %w[
            hjDFRYnSaG
            nUOW77iNcW
            lsKEOMxTkR
            Dtg42sYnM
            ffJQERoXGy
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
        hjDFRYnSaG: {
          type: {
            resolvedName: 'Spotlight'
          },
          nodes: [],
          props: {
            publicationId: project2.id,
            titleMultiloc: {
              en: 'Project 2'
            },
            publicationType: 'project',
            buttonTextMultiloc: {
              en: 'Look at this project!'
            },
            descriptionMultiloc: {
              en: 'this widget should NOT be deleted'
            }
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Spotlight',
          linkedNodes: {}
        },
        nUOW77iNcW: {
          type: {
            resolvedName: 'Selection'
          },
          nodes: [],
          props: {
            titleMultiloc: {
              en: 'Projects and folders'
            },
            adminPublicationIds: [
              project2.admin_publication.id,
              project1.admin_publication.id,
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
        lsKEOMxTkR: {
          type: {
            resolvedName: 'Spotlight'
          },
          nodes: [],
          props: {
            publicationId: project1.id,
            titleMultiloc: {
              en: 'Project 1'
            },
            publicationType: 'project',
            buttonTextMultiloc: {
              en: 'Look at this project!'
            },
            descriptionMultiloc: {
              en: 'this widget should be deleted'
            }
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Spotlight',
          linkedNodes: {}
        },
        Dtg42sYnM: {
          type: {
            resolvedName: 'Selection'
          },
          nodes: [],
          props: {
            titleMultiloc: {
              en: 'Projects and folders'
            },
            adminPublicationIds: [
              project1.admin_publication.id,
              project2.admin_publication.id
            ]
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Selection',
          linkedNodes: {}
        },
        ffJQERoXGy: {
          type: {
            resolvedName: 'Spotlight'
          },
          nodes: [],
          props: {
            publicationId: project1.id,
            titleMultiloc: {
              en: 'Project 1'
            },
            publicationType: 'project',
            buttonTextMultiloc: {
              en: 'Look at this project!'
            },
            descriptionMultiloc: {
              en: 'this widget should be deleted'
            }
          },
          custom: {},
          hidden: false,
          parent: 'ROOT',
          isCanvas: false,
          displayName: 'Spotlight',
          linkedNodes: {}
        }
      }
    end

    let!(:layout) { create(:homepage_layout, craftjs_json: craftjs) }

    it "deletes a publication's admin_publication ID from Selection widget(s) in homepage layout" do
      service.clean_homepage_layout_when_publication_deleted project1

      expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
        .to contain_exactly(project2.admin_publication.id, project_folder.admin_publication.id)

      expect(layout.reload.craftjs_json['Dtg42sYnM']['props']['adminPublicationIds'])
        .to contain_exactly(project2.admin_publication.id)
    end

    it 'deletes all Spotlight widgets for a publication from homepage layout' do
      service.clean_homepage_layout_when_publication_deleted project1

      expect(layout.reload.craftjs_json['ROOT']['nodes']).to eq %w[hjDFRYnSaG nUOW77iNcW Dtg42sYnM]

      expect(layout.reload.craftjs_json).to have_key 'hjDFRYnSaG'
      expect(layout.reload.craftjs_json).not_to have_key 'lsKEOMxTkR'
      expect(layout.reload.craftjs_json).not_to have_key 'ffJQERoXGy'
    end
  end
end
