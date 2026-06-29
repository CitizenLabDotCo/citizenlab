# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListAttachedImages do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  it 'lists images on a project' do
    image = create(:project_image, project: project)

    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Project', container_id: project.id },
      current_user:
    )

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to contain_exactly(image.id)
  end

  it 'lists images on an event' do
    event = create(:event, project: project)
    image = create(:event_image, event: event)

    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Event', container_id: event.id },
      current_user:
    )

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to contain_exactly(image.id)
  end

  it 'returns a not-found error when the container is missing' do
    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Project', container_id: SecureRandom.uuid },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to match(/Project not found/)
  end
end
