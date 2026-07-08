# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListGroups do
  let(:current_user) { create(:super_admin) }

  it 'lists groups ordered by newest first' do
    group_a = create(:group)
    group_b = create(:group)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck('id')).to eq([group_b.id, group_a.id])
  end

  it 'serializes group fields' do
    create(:group)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response.structured_content[:data].first)
      .to include('title_multiloc', 'membership_type', 'memberships_count')
  end

  it_behaves_like 'a paginated list tool'

  it 'filters by search on the title' do
    matching = create(:group, title_multiloc: { 'en' => 'Seniors club' })
    create(:group, title_multiloc: { 'en' => 'Youth council' })

    response = run_mcp_tool(described_class, params: { search: 'Seniors' }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck('id')).to eq([matching.id])
  end

  it 'filters by project_id' do
    project = create(:project)
    matching = create(
      :smart_group,
      rules: [{ ruleType: 'participated_in_project', predicate: 'in', value: [project.id] }]
    )
    create(:group)

    response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck('id')).to eq([matching.id])
  end
end
