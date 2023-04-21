# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Patches::Project do
  context 'when project has two layouts' do
    subject(:project) { layout.content_buildable }

    let(:layout) { create(:layout) }
    let! :another_layout do
      create(
        :layout,
        content_buildable: project,
        code: 'another_layout',
        enabled: false
      )
    end

    describe '#content_builder_layouts' do
      it 'returns the layouts of a project' do
        expect(project.content_builder_layouts).to match_array([layout, another_layout])
      end
    end

    describe '#destroy' do
      it 'destroys its layouts' do
        expect { project.destroy }.to change(ContentBuilder::Layout, :count).by(-2)
      end
    end
  end

  describe '.search_ids_by_all_including_patches' do
    def craftjs(props)
      {
        en: {
          ROOT: {
            type: 'div',
            nodes: %w[nfXxt3641Y Da_X6w7thf 2B2ApMKvLw nUEV-dMfSq],
            props: { id: 'e2e-content-builder-frame' },
            custom: {},
            hidden: false,
            isCanvas: true,
            displayName: 'div',
            linkedNodes: {}
          },
          '1pzsxkGIsQ': {
            type: { resolvedName: 'Container' },
            nodes: [],
            props: props,
            custom: {},
            hidden: false,
            parent: 'WSe1D-RM_b',
            isCanvas: true,
            displayName: 'Container',
            linkedNodes: {}
          }
        }
      }
    end

    def create_project(craftjs_props)
      create(:project, content_builder_layouts: [build(:layout, craftjs_jsonmultiloc: craftjs(craftjs_props))])
    end

    it 'finds projects by text, title, and url' do
      p1 = create_project(text: 'sometext here')
      __ = create_project(text: 'othertext')
      p2 = create_project(title: 'sometitle here')
      __ = create_project(title: 'othertitle')
      p3 = create_project(url: 'someurl')
      __ = create_project(url: 'otherurl')

      expect(Project.search_ids_by_all_including_patches('sometext')).to match_array([p1.id])
      expect(Project.search_ids_by_all_including_patches('sometitle')).to match_array([p2.id])
      expect(Project.search_ids_by_all_including_patches('someurl')).to match_array([p3.id])
      expect(Project.search_ids_by_all_including_patches('here')).to match_array([p1.id, p2.id])
    end

    it 'finds projects by both builder content and normal description' do
      p1 = create_project(text: 'sometext here')
      __ = create_project(text: 'othertext here')
      p2 = create(:project, description_multiloc: { en: 'sometext' })
      __ = create(:project, description_multiloc: { en: 'othertext' })

      expect(Project.search_ids_by_all_including_patches('sometext')).to match_array([p1.id, p2.id])
    end

    it 'does not find projects by internal craftjs fields' do
      p1 = create_project(text: 'sometext here')
      expect(Project.search_ids_by_all_including_patches('sometext')).to match_array([p1.id])

      expect(Project.search_ids_by_all_including_patches('Container')).to be_empty
      expect(Project.search_ids_by_all_including_patches('nodes')).to be_empty
      expect(Project.search_ids_by_all_including_patches('ROOT')).to be_empty
    end
  end
end
