# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListFileAttachments do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists attachments on a project ordered by position' do
    file_a, file_b = create_list(:file, 2, projects: [project])
    create(:file_attachment, file: file_a, attachable: project, position: 1)
    create(:file_attachment, file: file_b, attachable: project, position: 0)

    response = list(resource_type: 'project', resource_id: project.id)

    expect(response).not_to be_error
    file_ids = response.structured_content[:data].pluck(:file_id)
    expect(file_ids).to eq([file_b.id, file_a.id])
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { resource_type: 'project', resource_id: project.id } }
  end

  it 'returns a not-found error when the resource is missing' do
    response = list(resource_type: 'project', resource_id: SecureRandom.uuid)

    expect(response).to be_not_found('Resource (project)')
  end
end
