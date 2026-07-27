# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListProjects do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists projects' do
    projects = create_list(:project, 2)

    response = list

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to match_array(projects.map(&:id))
  end

  it 'serializes summary fields' do
    create(:project)

    response = list

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :slug, :publication_status)
  end

  it_behaves_like 'a paginated list tool'

  it 'filters by search on the title' do
    matching = create(:project, title_multiloc: { 'en' => 'Park renovation' })
    create(:project, title_multiloc: { 'en' => 'Traffic plan' })

    response = list(search: 'Park')

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to contain_exactly(matching.id)
  end
end
