# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListProjectFiles do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists files in the project' do
    files = create_list(:file, 2, projects: [project])
    create(:file, projects: [create(:project, :draft)])

    response = list(project_id: project.id)

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to match_array(files.map(&:id))
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { project_id: project.id } }
  end

  it 'returns a not-found error when the project is missing' do
    response = list(project_id: SecureRandom.uuid)

    expect(response).to be_not_found('Project')
  end
end
