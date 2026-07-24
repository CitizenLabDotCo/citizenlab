# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListFolders do
  let(:current_user) { create(:super_admin) }

  it 'lists folders' do
    folder_a, folder_b = create_list(:project_folder, 2)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to match_array([folder_a.id, folder_b.id])
  end

  it 'serializes folder fields' do
    create(:project_folder)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :slug)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { {} }
    let(:create_record) { -> { create(:project_folder) } }
  end

  it 'filters by search on the title' do
    matching = create(:project_folder, title_multiloc: { 'en' => 'Green spaces' })
    create(:project_folder, title_multiloc: { 'en' => 'Mobility' })

    response = run_mcp_tool(described_class, params: { search: 'Green' }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([matching.id])
  end
end
