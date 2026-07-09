# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::ConsultationsFolder do
  subject(:service) { described_class.new }

  def selection_ids(folder)
    layout = ContentBuilder::Layout.find_by(content_buildable: folder, code: 'project_folder_description')
    node = layout.craftjs_json.values.find { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'Selection' }
    node['props']['adminPublicationIds']
  end

  it 'creates a published Consultations folder and moves top-level projects into it' do
    top1 = create(:project)
    top2 = create(:project)
    group = create(:project_folder)
    grouped = create(:project)
    grouped.update!(folder_id: group.id)

    folder = service.run[:folder]

    expect(folder.slug).to eq('consultations')
    expect(folder.title_multiloc.values).to all(eq('Consultations'))
    expect(folder.admin_publication.publication_status).to eq('published')
    expect(top1.reload.admin_publication.parent).to eq(folder.admin_publication)
    expect(top2.reload.admin_publication.parent).to eq(folder.admin_publication)
    # a project already inside a group folder is left where it is
    expect(grouped.reload.admin_publication.parent).to eq(group.admin_publication)
  end

  it 'builds a folder layout with a Selection widget listing the folder projects then the group folders' do
    project = create(:project)
    group = create(:project_folder)

    folder = service.run[:folder]

    layout = ContentBuilder::Layout.find_by(content_buildable: folder, code: 'project_folder_description')
    expect(layout.enabled).to be(true)

    ids = selection_ids(folder)
    expect(ids).to include(project.reload.admin_publication.id, group.admin_publication.id)
    expect(ids).not_to include(folder.admin_publication.id) # the Consultations folder is not listed in itself
    # projects come before the group folders
    expect(ids.index(project.admin_publication.id)).to be < ids.index(group.admin_publication.id)
  end

  it 'adds the folder to the navigation bar as a custom folder item' do
    folder = service.run[:folder]

    item = folder.reload.nav_bar_item
    expect(item).to be_present
    expect(item.code).to eq('custom')
    expect(item.project_folder_id).to eq(folder.id)
  end

  it 'is idempotent — re-running reuses the folder, nav item and layout' do
    service.run
    folder = ProjectFolders::Folder.find_by(slug: 'consultations')

    expect { service.run }
      .to not_change { ProjectFolders::Folder.where(slug: 'consultations').count }
      .and(not_change { NavBarItem.where(project_folder: folder).count })
      .and(not_change { ContentBuilder::Layout.where(content_buildable: folder).count })
  end
end
