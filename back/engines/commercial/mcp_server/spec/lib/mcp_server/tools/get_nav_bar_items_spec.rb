# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::GetNavBarItems do
  let(:current_user) { create(:super_admin) }

  def run
    run_mcp_tool(described_class, params: {}, current_user:)
  end

  it 'returns the top-level items in display order, with targets and the staleness stamp' do
    create(:nav_bar_item, code: 'home', static_page: nil, title_multiloc: nil)
    page_item = create(:nav_bar_item, title_multiloc: { 'en' => 'About' })

    response = run

    expect(response).not_to be_error
    content = response.structured_content
    expect(content[:items].map { |item| item[:code] }).to eq %w[home custom]
    expect(content[:items].map { |item| item[:ordering] }).to eq [0, 1]
    expect(content[:items].last).to include(
      id: page_item.id,
      static_page_id: page_item.static_page_id,
      slug: page_item.static_page.slug,
      title_multiloc: hash_including('en' => 'About')
    )
    expect(content[:nav_last_updated_at]).to eq NavBarItem.maximum(:updated_at)
  end

  it 'serializes a dropdown with its ordered children and no slug of its own' do
    dropdown = create(:nav_bar_item, :dropdown)
    project = create(:project)
    folder = create(:project_folder)
    create(:nav_bar_item, parent: dropdown, static_page: nil, project: project, title_multiloc: nil)
    create(:nav_bar_item, parent: dropdown, static_page: nil, project_folder: folder, title_multiloc: nil)

    response = run

    expect(response).not_to be_error
    item = response.structured_content[:items].sole
    expect(item[:slug]).to be_nil
    expect(item[:children].map { |child| child.slice(:project_id, :project_folder_id) }).to eq [
      { project_id: project.id, project_folder_id: nil },
      { project_id: nil, project_folder_id: folder.id }
    ]
  end
end
