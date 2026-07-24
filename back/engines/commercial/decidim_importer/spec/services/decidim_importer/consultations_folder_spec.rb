# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::ConsultationsFolder do
  subject(:service) { described_class.new }

  def layout_for(folder)
    ContentBuilder::Layout.find_by(content_buildable: folder, code: 'project_folder_description')
  end

  def resolved_names(folder)
    layout_for(folder).craftjs_json.values
      .filter_map { |node| node['type'].is_a?(Hash) ? node['type']['resolvedName'] : nil }
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

  it 'gives every folder the standard description layout (title, description, published projects)' do
    group = create(:project_folder)

    folder = service.run[:folder]

    [folder, group].each do |f|
      layout = layout_for(f)
      expect(layout.enabled).to be(true)
      # the Published widget lists the folder's own published projects
      published = layout.craftjs_json.values.find { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'Published' }
      expect(resolved_names(f)).to include('FolderTitle', 'TextMultiloc', 'Published')
      expect(published['props']['folderId']).to eq(f.id)
    end
    # a plain group folder gets exactly the three standard widgets, nothing more
    expect(resolved_names(group)).to contain_exactly('FolderTitle', 'TextMultiloc', 'Published')
  end

  def selection_ids(folder)
    node = layout_for(folder).craftjs_json.values
      .find { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == 'Selection' }
    node&.dig('props', 'adminPublicationIds')
  end

  it 'links the Consultations folder out to every other folder except Assemblies' do
    group = create(:project_folder)
    assemblies = create(:project_folder, title_multiloc: { 'en' => 'Assemblies' }, slug: 'assemblies')

    folder = service.run[:folder]

    ids = selection_ids(folder)
    expect(ids).to include(group.admin_publication.id.to_s)
    expect(ids).not_to include(assemblies.admin_publication.id.to_s) # reached via its own nav bar item
    expect(ids).not_to include(folder.admin_publication.id.to_s)     # never links to itself
    # the Selection sits alongside the folder's own published-projects widget
    expect(resolved_names(folder)).to include('Published', 'Selection')
  end

  it 'adds no other-folders widget to the Consultations folder when there are no other folders' do
    folder = service.run[:folder]

    expect(resolved_names(folder)).not_to include('Selection')
  end

  it 'gives every folder a homepage preview description, deriving it from the description when present' do
    group = create(:project_folder,
      title_multiloc: { 'en' => 'Neighbourhoods' },
      description_multiloc: { 'en' => '<p>All the <strong>neighbourhood</strong> projects.</p>' },
      description_preview_multiloc: {})

    folder = service.run[:folder]

    # imported folder: preview derived from the (tag-stripped) description
    expect(group.reload.description_preview_multiloc['en']).to eq('All the neighbourhood projects.')
    # synthetic Consultations folder: no description, so it falls back to the title
    expect(folder.reload.description_preview_multiloc.values).to all(eq('Consultations'))
  end

  it 'leaves an existing homepage preview description untouched' do
    group = create(:project_folder, description_preview_multiloc: { 'en' => 'Kept as is' })

    service.run

    expect(group.reload.description_preview_multiloc).to eq({ 'en' => 'Kept as is' })
  end

  it 'adds the folder to the navigation bar as a custom folder item' do
    folder = service.run[:folder]

    item = folder.reload.nav_bar_item
    expect(item).to be_present
    expect(item.code).to eq('custom')
    expect(item.project_folder_id).to eq(folder.id)
  end

  it 'strips the nav bar down to Home plus the Consultations and Assemblies folders' do
    %w[home projects events all_input].each { |code| create(:nav_bar_item, code: code) }
    assemblies = create(:project_folder, title_multiloc: { 'en' => 'Assemblies' }, slug: 'assemblies')

    folder = service.run[:folder]

    codes_and_folders = NavBarItem.top_level.map { |item| item.project_folder_id || item.code }
    expect(codes_and_folders).to contain_exactly('home', folder.id, assemblies.id)
  end

  it 'leaves the nav bar without an Assemblies item when no Assemblies folder was imported' do
    %w[home projects events all_input].each { |code| create(:nav_bar_item, code: code) }

    folder = service.run[:folder]

    codes_and_folders = NavBarItem.top_level.map { |item| item.project_folder_id || item.code }
    expect(codes_and_folders).to contain_exactly('home', folder.id)
  end

  it 'is idempotent — re-running reuses the folder, nav item and layout' do
    service.run
    folder = ProjectFolders::Folder.find_by(slug: 'consultations')

    expect { service.run }
      .to not_change { ProjectFolders::Folder.where(slug: 'consultations').count }
      .and(not_change { NavBarItem.where(project_folder: folder).count })
      .and(not_change { NavBarItem.top_level.count })
      .and(not_change { ContentBuilder::Layout.where(content_buildable: folder).count })
  end
end
