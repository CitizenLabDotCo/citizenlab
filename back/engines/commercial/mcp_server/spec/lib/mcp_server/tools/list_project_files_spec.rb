# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListProjectFiles do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  it 'lists files in the project' do
    files = create_list(:file, 2, projects: [project])
    create(:file, projects: [create(:project, :draft)])

    response = run_mcp_tool(
      described_class,
      params: { project_id: project.id },
      current_user:
    )

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to match_array(files.map(&:id))
  end

  it 'returns a not-found error when the project is missing' do
    response = run_mcp_tool(
      described_class,
      params: { project_id: SecureRandom.uuid },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to match(/Project not found/)
  end
end
