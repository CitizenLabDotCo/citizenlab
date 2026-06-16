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

  describe '#migrate_buildable' do
    context 'with a project that has a WYSIWYG description' do
      let(:description) { { 'en' => '<p>Hello</p>', 'nl-BE' => '<p>Hallo</p>' } }
      let(:project) { create(:project, description_multiloc: description) }

      it 'creates an enabled project_description layout wrapping the description in a bridge node' do
        service.migrate_buildable(project, persist: true)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        expect(bridge_node(layout)['props']['text']).to eq(description)
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

    context 'with a blank description' do
      let(:project) { create(:project, description_multiloc: { 'en' => '<p></p>' }) }

      it 'skips it' do
        service.migrate_buildable(project, persist: true)
        expect(project.content_builder_layouts.count).to eq(0)
        expect(service.stats).to include(skipped_blank: 1)
      end
    end

    context 'with a description that only has an inline image (no text)' do
      let(:project) do
        create(:project, description_multiloc: { 'en' => '<p><img data-cl2-text-image-text-reference="abc"></p>' })
      end

      it 'is treated as content and migrated' do
        service.migrate_buildable(project, persist: true)
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

      it 'wraps the description in a bridge node while keeping the folder title and published-projects widgets' do
        # A folder on the Content Builder renders only its craftjs layout, so the
        # migration must preserve the published-projects list rather than produce
        # a description-only layout.
        service.migrate_buildable(folder, persist: true)

        layout = folder.content_builder_layouts.find_by(code: 'project_folder_description')
        expect(node_types(layout)).to include('FolderTitle', 'RichTextMultiloc', 'Published')
        expect(bridge_node(layout)['props']['text']).to eq(description)
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
