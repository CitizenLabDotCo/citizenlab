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

      it 'creates an enabled, empty description layout for a project with no description' do
        project = create(:project, description_multiloc: { 'en' => '<p></p>' })

        service.provision_for(project)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        expect(layout.content_buildable_type).to eq('Project')
        expect(layout.craftjs_json).to have_key('ROOT')
        expect(layout.craftjs_json['ROOT']['nodes']).to eq([])
      end

      it 'wraps an existing description so a copied/imported one is not hidden behind an empty frame' do
        project = create(:project, description_multiloc: { 'en' => '<p>Carried over</p>' })

        service.provision_for(project)

        layout = project.content_builder_layouts.find_by(code: 'project_description')
        node = layout.craftjs_json.values.find do |n|
          n.is_a?(Hash) && n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'TextMultiloc'
        end
        expect(node['props']['text']).to eq({ 'en' => '<p>Carried over</p>' })
      end

      it 'creates the default folder layout (title + published projects) for a folder' do
        folder = create(:project_folder)

        service.provision_for(folder)

        layout = folder.content_builder_layouts.find_by(code: 'project_folder_description')
        expect(layout).to be_present
        expect(layout.enabled).to be(true)
        expect(node_types(layout)).to include('FolderTitle', 'Published')
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

  describe '#ensure_on_content_builder!' do
    def description_node(layout)
      widget_types = %w[TextMultiloc RichTextMultiloc]
      layout.craftjs_json.values.find do |node|
        node.is_a?(Hash) && node['type'].is_a?(Hash) &&
          widget_types.include?(node['type']['resolvedName'])
      end
    end

    it 'uses a native TextMultiloc widget for a text-only project description' do
      project = create(:project, description_multiloc: { 'en' => '<p>Hello <strong>world</strong></p>' })

      service.ensure_on_content_builder!(project)

      layout = project.content_builder_layouts.find_by(code: 'project_description')
      expect(layout.enabled).to be(true)
      node = description_node(layout)
      expect(node['type']['resolvedName']).to eq('TextMultiloc')
      expect(node['props']['text']).to eq({ 'en' => '<p>Hello <strong>world</strong></p>' })
    end

    it 'uses the RichTextMultiloc bridge for a description with an inline image' do
      project = create(:project, description_multiloc: { 'en' => '<p><img data-cl2-text-image-text-reference="abc"></p>' })

      service.ensure_on_content_builder!(project)

      node = description_node(project.content_builder_layouts.find_by(code: 'project_description'))
      expect(node['type']['resolvedName']).to eq('RichTextMultiloc')
    end

    it 'uses the bridge for a description with a video embed' do
      project = create(:project, description_multiloc: { 'en' => '<iframe src="https://youtube.com/embed/x"></iframe>' })

      service.ensure_on_content_builder!(project)

      node = description_node(project.content_builder_layouts.find_by(code: 'project_description'))
      expect(node['type']['resolvedName']).to eq('RichTextMultiloc')
    end

    it 'creates an empty default layout for a blank description' do
      project = create(:project, description_multiloc: { 'en' => '<p></p>' })

      service.ensure_on_content_builder!(project)

      layout = project.content_builder_layouts.find_by(code: 'project_description')
      expect(layout.enabled).to be(true)
      expect(description_node(layout)).to be_nil
      expect(layout.craftjs_json['ROOT']['nodes']).to eq([])
    end

    it 'keeps a text-only folder description in the default TextMultiloc layout' do
      folder = create(:project_folder, description_multiloc: { 'en' => '<p>About this folder</p>' })

      service.ensure_on_content_builder!(folder)

      layout = folder.content_builder_layouts.find_by(code: 'project_folder_description')
      expect(node_types(layout)).to include('FolderTitle', 'TextMultiloc', 'Published')
    end

    it 'is idempotent — skips when a layout already exists' do
      project = create(:project, description_multiloc: { 'en' => '<p>Hi</p>' })
      create(:layout, content_buildable: project, code: 'project_description', enabled: true)

      expect { service.ensure_on_content_builder!(project) }
        .not_to change { project.content_builder_layouts.count }
    end

    it 're-points a disabled layout at the description and enables it' do
      project = create(:project, description_multiloc: { 'en' => '<p>Hi</p>' })
      layout = create(:layout, content_buildable: project, code: 'project_description', enabled: false)

      expect { service.ensure_on_content_builder!(project) }
        .not_to change { project.content_builder_layouts.count }

      expect(layout.reload.enabled).to be(true)
      node = description_node(layout)
      expect(node['type']['resolvedName']).to eq('TextMultiloc')
      expect(node['props']['text']).to eq({ 'en' => '<p>Hi</p>' })
    end
  end

  describe '#text_node / #bridge_node (generic builders reused by the migration)' do
    it 'builds a TextMultiloc node carrying the multiloc' do
      node = service.text_node({ 'en' => '<p>Hi</p>' })
      expect(node['type']['resolvedName']).to eq('TextMultiloc')
      expect(node['props']['text']).to eq({ 'en' => '<p>Hi</p>' })
    end

    it 'builds a RichTextMultiloc bridge node carrying the multiloc' do
      node = service.bridge_node({ 'en' => '<p>Hi</p>' })
      expect(node['type']['resolvedName']).to eq('RichTextMultiloc')
      expect(node['props']['text']).to eq({ 'en' => '<p>Hi</p>' })
    end
  end

  describe '#provision_all_descriptions!' do
    it 'puts every project and folder description on the Content Builder' do
      project = create(:project, description_multiloc: { 'en' => '<p>P</p>' })
      folder = create(:project_folder, description_multiloc: { 'en' => '<p>F</p>' })

      service.provision_all_descriptions!

      expect(project.content_builder_layouts.find_by(code: 'project_description')&.enabled).to be(true)
      expect(folder.content_builder_layouts.find_by(code: 'project_folder_description')&.enabled).to be(true)
    end

    it 'does not add an AboutBox — that is the one-time migration\'s concern, not provisioning' do
      project = create(:project, description_multiloc: { 'en' => '<p>P</p>' })

      service.provision_all_descriptions!

      expect(node_types(project.content_builder_layouts.find_by(code: 'project_description')))
        .not_to include('AboutBox', 'TwoColumn')
    end

    it 'does nothing when the feature is disabled' do
      settings = AppConfiguration.instance.settings
      settings['project_description_builder'] = { 'enabled' => false, 'allowed' => false }
      AppConfiguration.instance.update!(settings: settings)
      create(:project, description_multiloc: { 'en' => '<p>P</p>' })

      service.provision_all_descriptions!

      expect(ContentBuilder::Layout.where(code: 'project_description').count).to eq(0)
    end
  end
end
