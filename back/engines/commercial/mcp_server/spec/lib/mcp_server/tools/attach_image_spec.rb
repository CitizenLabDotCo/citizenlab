# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::AttachImage do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }
  let(:remote_url) { 'https://example.com/image.jpg' }
  let!(:fixture_path) { stub_remote_image_download(remote_url) }

  it 'attaches an image to a project' do
    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Project', container_id: project.id, remote_url: remote_url },
      current_user:
    )

    expect(response).not_to be_error
    expect(project.reload.project_images.count).to eq(1)
    expect(project.project_images.first.image.file.read).to eq(fixture_path.binread)
  end

  it 'attaches an image to an event' do
    event = create(:event, project: project)

    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Event', container_id: event.id, remote_url: remote_url },
      current_user:
    )

    expect(response).not_to be_error
    expect(event.reload.event_images.count).to eq(1)
    expect(event.event_images.first.image.file.read).to eq(fixture_path.binread)
  end

  it 'refuses when the project is published' do
    published = create(:project, admin_publication_attributes: { publication_status: 'published' })

    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Project', container_id: published.id, remote_url: remote_url },
      current_user:
    )

    expect(response).to be_unauthorized_project
    expect(published.reload.project_images.count).to eq(0)
  end

  it 'returns a not-found error when the container is missing' do
    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Project', container_id: SecureRandom.uuid, remote_url: remote_url },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to match(/Project not found/)
  end
end
