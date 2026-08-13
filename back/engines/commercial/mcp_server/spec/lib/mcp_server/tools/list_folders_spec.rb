# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListFolders do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists folders' do
    folders = create_list(:project_folder, 2)

    response = list

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to match_array(folders.map(&:id))
  end

  it 'serializes folder fields' do
    create(:project_folder)

    response = list

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :slug)
  end

  it_behaves_like 'a paginated list tool'

  it 'filters by search on the title' do
    matching = create(:project_folder, title_multiloc: { 'en' => 'Green spaces' })
    create(:project_folder, title_multiloc: { 'en' => 'Mobility' })

    response = list(search: 'Green')

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to contain_exactly(matching.id)
  end
end
