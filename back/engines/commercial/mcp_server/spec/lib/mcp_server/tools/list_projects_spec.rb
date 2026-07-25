# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListProjects do
  let(:current_user) { create(:super_admin) }

  it 'lists projects' do
    project_a, project_b = create_list(:project, 2)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to match_array([project_a.id, project_b.id])
  end

  it 'serializes summary fields' do
    create(:project)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :slug, :publication_status)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { {} }
    let(:create_record) { -> { create(:project) } }
  end

  it 'filters by search on the title' do
    matching = create(:project, title_multiloc: { 'en' => 'Park renovation' })
    create(:project, title_multiloc: { 'en' => 'Traffic plan' })

    response = run_mcp_tool(described_class, params: { search: 'Park' }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([matching.id])
  end
end
