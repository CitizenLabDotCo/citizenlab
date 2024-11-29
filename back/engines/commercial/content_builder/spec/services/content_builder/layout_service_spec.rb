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
        }
      }
    end

    let!(:layout) { create(:homepage_layout, craftjs_json: craftjs) }

    it 'deletes a single admin_publication ID from the homepage layout craftjs_json' do
      service.remove_admin_publication_id_from_homepage_layout project1

      expect(layout.reload.craftjs_json['nUOW77iNcW']['props']['adminPublicationIds'])
        .to match_array [project2.admin_publication.id, project_folder.admin_publication.id]
    end
  end
end
