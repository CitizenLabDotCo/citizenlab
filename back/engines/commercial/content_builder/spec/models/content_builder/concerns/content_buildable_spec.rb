# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::Concerns::ContentBuildable do
  %i[project project_folder].each do |factory|
    context factory.to_s do
      context "when #{factory} has two layouts" do
        subject(:buildable) { create(factory) }

        let!(:layout) { create(:layout, content_buildable: buildable) }
        let!(:another_layout) do
          create(
            :layout,
            content_buildable: buildable,
            code: 'another_layout',
            enabled: false
          )
        end

        describe '#content_builder_layouts' do
          it 'returns the layouts of the buildable model' do
            expect(buildable.content_builder_layouts).to contain_exactly(layout, another_layout)
          end
        end

        describe '#destroy' do
          it 'destroys its layouts' do
            expect { buildable.destroy }.to change(ContentBuilder::Layout, :count).by(-2)
          end
        end

        describe '#uses_content_builder?' do
          it 'returns true if it has enabled layouts' do
            expect(buildable.uses_content_builder?).to be true
          end

          it 'returns false if it has no enabled layouts' do
            layout.update!(enabled: false)
            expect(buildable.uses_content_builder?).to be false
          end

          it 'returns false if it has no layouts' do
            layout.destroy!
            another_layout.destroy!
            expect(buildable.uses_content_builder?).to be false
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

        def model_class(factory)
          return Project if factory == :project

          ProjectFolders::Folder if factory == :project_folder
        end

        def create_model(factory, craftjs_json_props)
          create(
            factory,
            content_builder_layouts: [
              build(:layout, content_buildable_type: model_class(factory), craftjs_json: craftjs(craftjs_json_props))
            ]
          )
        end

        it "finds #{factory} by text, title, alt, and url" do
          p1 = create_model(factory, { text: { 'fr-FR' => 'sometext here' } })
          __ = create_model(factory, { text: { 'en' => 'othertext' } })
          p2 = create_model(factory, { title: { 'en' => 'sometitle here', 'fr-FR' => 'othertitle' } })
          __ = create_model(factory, { title: { 'en' => 'othertitle' } })
          p3 = create_model(factory, { url: { 'en' => 'someurl' } })
          __ = create_model(factory, { url: { 'en' => 'otherurl' } })
          p4 = create_model(factory, { alt: { 'en' => 'otheralt', 'nl-NL' => 'somealt' } })
          __ = create_model(factory, { alt: { 'en' => 'otheralt' } })

          model = model_class(factory)
          expect(model.search_ids_by_all_including_patches('sometext')).to contain_exactly(p1.id)
          expect(model.search_ids_by_all_including_patches('sometitle')).to contain_exactly(p2.id)
          expect(model.search_ids_by_all_including_patches('someurl')).to contain_exactly(p3.id)
          expect(model.search_ids_by_all_including_patches('somealt')).to contain_exactly(p4.id)
          expect(model.search_ids_by_all_including_patches('here')).to contain_exactly(p1.id, p2.id)
        end

        it "finds #{factory} by both builder content and normal description" do
          p1 = create_model(factory, { text: { 'en' => 'othertext', 'fr-FR' => 'sometext here' } })
          __ = create_model(factory, { text: { 'en' => 'othertext here' } })
          p2 = create(factory, description_multiloc: { en: 'sometext' })
          __ = create(factory, description_multiloc: { en: 'othertext' })

          model = model_class(factory)
          expect(model.search_ids_by_all_including_patches('sometext')).to contain_exactly(p1.id, p2.id)
        end

        it "does not find #{factory} by internal craftjs fields" do
          p1 = create_model(factory, { text: { 'en' => 'sometext here' } })

          model = model_class(factory)
          expect(model.search_ids_by_all_including_patches('sometext')).to contain_exactly(p1.id)
          expect(model.search_ids_by_all_including_patches('Container')).to be_empty
          expect(model.search_ids_by_all_including_patches('nodes')).to be_empty
          expect(model.search_ids_by_all_including_patches('ROOT')).to be_empty
        end
      end
    end
  end
end
