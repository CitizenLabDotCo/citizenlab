# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::DescriptionLayoutService do
  subject(:service) { described_class.new }

  def node_types(layout)
    layout.craftjs_json.values.filter_map do |node|
      next unless node.is_a?(Hash)

      node['type'].is_a?(Hash) ? node['type']['resolvedName'] : node['type']
    end
  end

  describe '#provision_for' do
    context 'when the project_description_builder feature is enabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['project_description_builder'] = { 'enabled' => true, 'allowed' => true }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'creates an enabled, empty description layout for a project' do
        project = create(:project)

        service.provision_for(project)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        expect(layout.content_buildable_type).to eq('Project')
        expect(layout.craftjs_json).to have_key('ROOT')
        expect(layout.craftjs_json['ROOT']['nodes']).to eq([])
      end

      it 'creates the default folder layout (title + published projects) for a folder' do
        folder = create(:project_folder)

        service.provision_for(folder)

        layout = folder.content_builder_layouts.find_by(code: 'project_folder_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        expect(node_types(layout)).to include('FolderTitle', 'Published')
      end

      it 'is idempotent — does nothing when a layout already exists' do
        project = create(:project)
        create(:layout, content_buildable: project, code: 'project_description', enabled: true)

        expect { service.provision_for(project) }
          .not_to change { project.content_builder_layouts.count }
      end
    end

    context 'when the project_description_builder feature is disabled' do
      before do
        settings = AppConfiguration.instance.settings
        settings['project_description_builder'] = { 'enabled' => false, 'allowed' => false }
        AppConfiguration.instance.update!(settings: settings)
      end

      it 'does not create a layout' do
        project = create(:project)

        service.provision_for(project)

        expect(project.content_builder_layouts.count).to eq(0)
      end
    end
  end
end
