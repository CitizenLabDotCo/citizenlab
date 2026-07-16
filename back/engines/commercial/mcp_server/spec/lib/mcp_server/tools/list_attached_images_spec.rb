# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListAttachedImages do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists images on a project' do
    images = create_list(:project_image, 2, project:)

    response = list(resource_type: 'project', resource_id: project.id)

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to match_array(images.map(&:id))
  end

  it 'lists images on an event' do
    event = create(:event, project:)
    images = create_list(:event_image, 2, event:)

    response = list(resource_type: 'event', resource_id: event.id)

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to match_array(images.map(&:id))
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { resource_type: 'project', resource_id: project.id } }
  end

  it 'returns a not-found error when the resource is missing' do
    response = list(resource_type: 'project', resource_id: SecureRandom.uuid)

    expect(response).to be_not_found('Resource (project)')
  end
end
