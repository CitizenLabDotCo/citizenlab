# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListAttachedImages do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  it 'lists images on a project' do
    images = create_list(:project_image, 2, project:)

    response = run_mcp_tool(
      described_class,
      params: { resource_type: 'Project', resource_id: project.id },
      current_user:
    )

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to match_array(images.map(&:id))
  end

  it 'lists images on an event' do
    event = create(:event, project:)
    images = create_list(:event_image, 2, event:)

    response = run_mcp_tool(
      described_class,
      params: { resource_type: 'Event', resource_id: event.id },
      current_user:
    )

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to match_array(images.map(&:id))
  end

  it 'returns a not-found error when the resource is missing' do
    response = run_mcp_tool(
      described_class,
      params: { resource_type: 'Project', resource_id: SecureRandom.uuid },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to match(/Project not found/)
  end
end
