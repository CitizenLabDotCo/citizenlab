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

    describe '#uses_content_builder?' do
      it 'returns true if it has enabled layouts' do
        expect(project.uses_content_builder?).to be true
      end

      it 'returns false if it has no enabled layouts' do
        layout.update!(enabled: false)
        expect(project.uses_content_builder?).to be false
      end

      it 'returns false if it has no layouts' do
        layout.destroy!
        another_layout.destroy!
        expect(project.uses_content_builder?).to be false
      end
    end
  end

  describe '.search_ids_by_all_including_patches' do
    def craftjs(props)
      {
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
    end

    def create_project(craftjs_json_props)
      create(:project, content_builder_layouts: [build(:layout, craftjs_json: craftjs(craftjs_json_props))])
    end

    it 'finds projects by text, title, alt, and url' do
      p1 = create_project({ text: { 'fr-FR' => 'sometext here' } })
      __ = create_project({ text: { 'en' => 'othertext' } })
      p2 = create_project({ title: { 'en' => 'sometitle here', 'fr-FR' => 'othertitle' } })
      __ = create_project({ title: { 'en' => 'othertitle' } })
      p3 = create_project({ url: { 'en' => 'someurl' } })
      __ = create_project({ url: { 'en' => 'otherurl' } })
      p4 = create_project({ alt: { 'en' => 'otheralt', 'nl-NL' => 'somealt' } })
      __ = create_project({ alt: { 'en' => 'otheralt' } })

      expect(Project.search_ids_by_all_including_patches('sometext')).to match_array([p1.id])
      expect(Project.search_ids_by_all_including_patches('sometitle')).to match_array([p2.id])
      expect(Project.search_ids_by_all_including_patches('someurl')).to match_array([p3.id])
      expect(Project.search_ids_by_all_including_patches('somealt')).to match_array([p4.id])
      expect(Project.search_ids_by_all_including_patches('here')).to match_array([p1.id, p2.id])
    end

    it 'finds projects by both builder content and normal description' do
      p1 = create_project({ text: { 'en' => 'othertext', 'fr-FR' => 'sometext here' } })
      __ = create_project({ text: { 'en' => 'othertext here' } })
      p2 = create(:project, description_multiloc: { en: 'sometext' })
      __ = create(:project, description_multiloc: { en: 'othertext' })

      expect(Project.search_ids_by_all_including_patches('sometext')).to match_array([p1.id, p2.id])
    end

    it 'does not find projects by internal craftjs fields' do
      p1 = create_project({ text: { 'en' => 'sometext here' } })
      expect(Project.search_ids_by_all_including_patches('sometext')).to match_array([p1.id])

      expect(Project.search_ids_by_all_including_patches('Container')).to be_empty
      expect(Project.search_ids_by_all_including_patches('nodes')).to be_empty
      expect(Project.search_ids_by_all_including_patches('ROOT')).to be_empty
    end
  end
end
