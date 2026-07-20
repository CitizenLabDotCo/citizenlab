# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListFileAttachments do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  it 'lists attachments on a project ordered by position' do
    file_a, file_b = create_list(:file, 2, projects: [project])
    create(:file_attachment, file: file_a, attachable: project, position: 1)
    create(:file_attachment, file: file_b, attachable: project, position: 0)

    response = run_mcp_tool(
      described_class,
      params: { resource_type: 'project', resource_id: project.id },
      current_user:
    )

    expect(response).not_to be_error
    file_ids = response.structured_content[:data].pluck(:file_id)
    expect(file_ids).to eq([file_b.id, file_a.id])
  end

  it 'returns a not-found error when the resource is missing' do
    response = run_mcp_tool(
      described_class,
      params: { resource_type: 'project', resource_id: SecureRandom.uuid },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to include('Resource (project) not found')
  end
end
