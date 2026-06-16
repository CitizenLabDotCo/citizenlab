# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../lib/tasks/single_use/services/description_to_content_builder_migration_service'

RSpec.describe Tasks::SingleUse::Services::DescriptionToContentBuilderMigrationService do
  subject(:service) { described_class.new }

  def bridge_node(layout)
    layout.craftjs_json.values.find do |node|
      node.is_a?(Hash) && node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'RichTextMultiloc'
    end
  end

  # The description node regardless of widget (native TextMultiloc for text, or the
  # RichTextMultiloc bridge for descriptions with inline media).
  def description_node(layout)
    widget_types = %w[TextMultiloc RichTextMultiloc]
    layout.craftjs_json.values.find do |node|
      node.is_a?(Hash) && node['type'].is_a?(Hash) &&
        widget_types.include?(node['type']['resolvedName'])
    end
  end

  describe '#migrate_buildable' do
    context 'with a project that has a WYSIWYG description' do
      let(:description) { { 'en' => '<p>Hello</p>', 'nl-BE' => '<p>Hallo</p>' } }
      let(:project) { create(:project, description_multiloc: description) }

      it 'creates an enabled project_description layout wrapping text in a native TextMultiloc node' do
        service.migrate_buildable(project, persist: true)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        node = description_node(layout)
        expect(node['type']['resolvedName']).to eq('TextMultiloc')
        expect(node['props']['text']).to eq(description)
        expect(service.stats).to include(migrated: 1, projects_migrated: 1)
      end

      it 'sets content_buildable_type so the controller lookup finds the layout' do
        # Regression guard: a NULL content_buildable_type makes the layout
        # invisible to the controller's find_by! (404 / empty editor).
        service.migrate_buildable(project, persist: true)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        expect(layout.content_buildable_type).to eq('Project')
        expect(
          ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_description')
        ).to eq(layout)
      end

      it 'leaves description_multiloc untouched' do
        service.migrate_buildable(project, persist: true)
        expect(project.reload.description_multiloc).to eq(description)
      end

      it 'does not write when persist is false' do
        service.migrate_buildable(project, persist: false)
        expect(project.content_builder_layouts.count).to eq(0)
        expect(service.stats).to include(migrated: 1)
      end

      it 'is idempotent — a second run skips the already-migrated project' do
        service.migrate_buildable(project, persist: true)
        second = described_class.new
        second.migrate_buildable(project, persist: true)

        expect(project.content_builder_layouts.where(code: 'project_description').count).to eq(1)
        expect(second.stats).to include(skipped_existing: 1)
      end
    end

    context 'with a disabled (straggler) layout' do
      let(:description) { { 'en' => '<p>Live description</p>' } }
      let(:project) { create(:project, description_multiloc: description) }

      let(:layout_with_content) do
        {
          'ROOT' => {
            'type' => 'div', 'isCanvas' => true, 'props' => {},
            'displayName' => 'div', 'nodes' => ['text1'], 'linkedNodes' => {}
          },
          'text1' => {
            'type' => { 'resolvedName' => 'TextMultiloc' }, 'isCanvas' => false,
            'props' => { 'text' => { 'en' => '<p>old builder draft</p>' } },
            'displayName' => 'TextMultiloc', 'parent' => 'ROOT', 'nodes' => [], 'linkedNodes' => {}
          }
        }
      end

      def description_layout
        project.content_builder_layouts.find_by(code: 'project_description')
      end

      it 're-enables an empty disabled layout and points it at the description' do
        create(:layout, content_buildable: project, code: 'project_description', enabled: false, craftjs_json: {})

        service.migrate_buildable(project, persist: true)

        expect(description_layout.enabled).to be(true)
        expect(description_node(description_layout)['props']['text']).to eq(description)
        expect(project.content_builder_layouts.where(code: 'project_description').count).to eq(1)
        expect(service.stats).to include(migrated: 1, remigrated_disabled: 1)
        expect(service.stats[:remigrated_disabled_with_content]).to eq(0)
      end

      it 'overwrites a disabled layout that held builder content and flags it' do
        create(
          :layout,
          content_buildable: project, code: 'project_description', enabled: false, craftjs_json: layout_with_content
        )

        service.migrate_buildable(project, persist: true)

        expect(description_layout.enabled).to be(true)
        expect(description_node(description_layout)['props']['text']).to eq(description)
        expect(service.stats).to include(remigrated_disabled: 1, remigrated_disabled_with_content: 1)
      end

      it 'leaves an already-enabled layout untouched' do
        create(
          :layout,
          content_buildable: project, code: 'project_description', enabled: true, craftjs_json: layout_with_content
        )

        service.migrate_buildable(project, persist: true)

        expect(description_layout.craftjs_json).to eq(layout_with_content)
        expect(service.stats).to include(skipped_existing: 1)
        expect(service.stats).not_to include(remigrated_disabled: 1)
      end

      it 'does not write when persist is false but still counts the straggler' do
        create(:layout, content_buildable: project, code: 'project_description', enabled: false, craftjs_json: {})

        service.migrate_buildable(project, persist: false)

        expect(description_layout.enabled).to be(false)
        expect(service.stats).to include(remigrated_disabled: 1)
      end
    end

    context 'with a blank description' do
      let(:project) { create(:project, description_multiloc: { 'en' => '<p></p>' }) }

      it 'provisions an enabled default (empty) layout so it still lives on the Content Builder' do
        service.migrate_buildable(project, persist: true)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        expect(bridge_node(layout)).to be_nil
        expect(layout.craftjs_json).to have_key('ROOT')
        expect(service.stats).to include(migrated: 1, created_blank: 1, projects_migrated: 1)
      end
    end

    context 'with a description that has inline media (an image)' do
      let(:project) do
        create(:project, description_multiloc: { 'en' => '<p><img data-cl2-text-image-text-reference="abc"></p>' })
      end

      it 'wraps it in the lossless RichTextMultiloc bridge widget' do
        service.migrate_buildable(project, persist: true)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        expect(bridge_node(layout)).to be_present
        expect(service.stats).to include(migrated: 1)
      end
    end

    context 'with a folder' do
      let(:description) { { 'en' => '<p>Folder</p>' } }
      let(:folder) { create(:project_folder, description_multiloc: description) }

      def node_types(layout)
        layout.craftjs_json.values.filter_map do |node|
          next unless node.is_a?(Hash)

          node['type'].is_a?(Hash) ? node['type']['resolvedName'] : node['type']
        end
      end

      it 'creates a project_folder_description layout' do
        service.migrate_buildable(folder, persist: true)
        expect(folder.content_builder_layouts.find_by(code: 'project_folder_description')).to be_present
        expect(service.stats).to include(migrated: 1, folders_migrated: 1)
      end

      it 'wraps the text description in a TextMultiloc node while keeping the folder title and published-projects widgets' do
        # A folder on the Content Builder renders only its craftjs layout, so the
        # migration must preserve the published-projects list rather than produce
        # a description-only layout.
        service.migrate_buildable(folder, persist: true)

        layout = folder.content_builder_layouts.find_by(code: 'project_folder_description')
        expect(node_types(layout)).to include('FolderTitle', 'TextMultiloc', 'Published')
        expect(description_node(layout)['props']['text']).to eq(description)
      end

      context 'when the description is blank' do
        let(:folder) { create(:project_folder, description_multiloc: { 'en' => '' }) }

        it 'provisions the default folder layout (title + published projects) with no bridge node' do
          service.migrate_buildable(folder, persist: true)

          layout = folder.content_builder_layouts.find_by(code: 'project_folder_description')
          expect(layout.enabled).to be(true)
          expect(bridge_node(layout)).to be_nil
          expect(node_types(layout)).to include('FolderTitle', 'Published')
          expect(service.stats).to include(created_blank: 1, folders_migrated: 1)
        end
      end
    end
  end

  describe '#migrate' do
    it 'migrates projects and folders in the tenant' do
      create(:project, description_multiloc: { 'en' => '<p>P</p>' })
      create(:project_folder, description_multiloc: { 'en' => '<p>F</p>' })

      service.migrate(persist: true)

      expect(service.stats[:projects_migrated]).to be >= 1
      expect(service.stats[:folders_migrated]).to be >= 1
    end
  end
end
