# frozen_string_literal: true

require 'rails_helper'

describe ContentBuilder::LayoutProvisioningService do
  subject(:service) { described_class.new }

  def node_types(layout)
    layout.craftjs_json.values.filter_map do |node|
      next unless node.is_a?(Hash)

      node['type'].is_a?(Hash) ? node['type']['resolvedName'] : node['type']
    end
  end

  describe '#provision_for' do
    it 'creates an enabled project_page layout for a project' do
      project = create(:project)

      service.provision_for(project)

      layout = project.content_builder_layouts.find_by(code: 'project_page')
      expect(layout).to be_present
      expect(layout.enabled).to be(true)
      expect(layout.content_buildable_type).to eq('Project')
      expect(node_types(layout)).to include('ProjectBanner', 'ProjectTitle', 'ProjectPageBody')
    end

    it 'does not create a description layout for a project' do
      project = create(:project)

      service.provision_for(project)

      expect(project.content_builder_layouts.where(code: 'project_description')).to be_empty
    end

    it 'creates the default folder layout (title + published projects) for a folder' do
      folder = create(:project_folder)

      service.provision_for(folder)

      layout = folder.content_builder_layouts.find_by(code: 'project_folder_description')
      expect(layout).to be_present
      expect(layout.enabled).to be(true)
      expect(layout.content_buildable_type).to eq('ProjectFolders::Folder')
      expect(node_types(layout)).to include('FolderTitle', 'TextMultiloc', 'Published')
    end

    it 'does not create a project_page layout for a folder' do
      folder = create(:project_folder)

      service.provision_for(folder)

      expect(folder.content_builder_layouts.where(code: 'project_page')).to be_empty
    end
  end

  describe '#ensure_on_content_builder!' do
    it 'is idempotent — a second run changes nothing' do
      project = create(:project)
      service.ensure_on_content_builder!(project)

      expect { service.ensure_on_content_builder!(project) }
        .not_to change { project.content_builder_layouts.count }
    end

    it 'leaves an existing project page untouched' do
      project = create(:project)
      page = create(:layout, content_buildable: project, code: 'project_page', enabled: true)

      expect { service.ensure_on_content_builder!(project) }
        .not_to change { project.content_builder_layouts.count }
      expect(page.reload.updated_at).to eq(page.created_at)
    end

    it 'leaves an existing enabled folder layout untouched' do
      folder = create(:project_folder)
      layout = create(:layout, content_buildable: folder, code: 'project_folder_description', enabled: true)

      expect { service.ensure_on_content_builder!(folder) }
        .not_to change { folder.content_builder_layouts.count }
      expect(layout.reload.updated_at).to eq(layout.created_at)
    end

    it 're-points a disabled folder layout at the default layout and enables it' do
      folder = create(:project_folder)
      layout = create(:layout, content_buildable: folder, code: 'project_folder_description', enabled: false)

      expect { service.ensure_on_content_builder!(folder) }
        .not_to change { folder.content_builder_layouts.where(code: 'project_folder_description').count }

      expect(layout.reload.enabled).to be(true)
      expect(node_types(layout)).to include('FolderTitle', 'Published')
    end

    it 'rejects an unsupported buildable' do
      expect { service.ensure_on_content_builder!(create(:idea)) }.to raise_error(ArgumentError)
    end
  end

  describe '#default_folder_craftjs_json' do
    it 'seeds the TEXT node with a description when one is given' do
      folder = create(:project_folder)

      craftjs = service.default_folder_craftjs_json(folder, { 'en' => '<p>About this folder</p>' })

      expect(craftjs['TEXT']['props']['text']).to eq({ 'en' => '<p>About this folder</p>' })
    end

    it 'leaves the TEXT node empty when no description is given' do
      folder = create(:project_folder)

      expect(service.default_folder_craftjs_json(folder)['TEXT']['props']['text']).to eq({})
    end
  end

  describe '#provision_all!' do
    it 'puts every project page and folder description on the Content Builder' do
      project = create(:project)
      folder = create(:project_folder)

      service.provision_all!

      expect(project.content_builder_layouts.find_by(code: 'project_page')&.enabled).to be(true)
      expect(folder.content_builder_layouts.find_by(code: 'project_folder_description')&.enabled).to be(true)
    end
  end
end
