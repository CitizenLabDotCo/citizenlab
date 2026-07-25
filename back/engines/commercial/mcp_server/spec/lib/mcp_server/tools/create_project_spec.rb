# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateProject do
  let(:current_user) { create(:super_admin) }
  let(:params) do
    {
      title_multiloc: { 'en' => 'New project' }
    }
  end

  it 'creates a draft project' do
    response = nil
    expect do
      response = run_mcp_tool(described_class, params:, current_user:)
    end.to change(Project, :count).by(1)

    expect(response).not_to be_error

    project = Project.find(response.structured_content[:id])
    expect(project.admin_publication.publication_status).to eq('draft')
    expect(response.structured_content[:admin_url]).to end_with("/admin/projects/#{project.id}")
    expect(response.structured_content[:public_url]).to end_with("/projects/#{project.slug}")
  end

  it 'returns structured validation errors for invalid params' do
    response = nil
    expect do
      response = run_mcp_tool(described_class, params: params.merge(visible_to: 'everybody'), current_user:)
    end.not_to change(Project, :count)

    expect(response).to be_error
    expect(response.structured_content[:errors].pluck(:attribute)).to include('visible_to')
  end

  it 'attaches a remote header_bg by URL' do
    remote_url = 'https://example.com/header.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run_mcp_tool(
      described_class,
      params: params.merge(remote_header_bg_url: remote_url),
      current_user:
    )

    expect(response).not_to be_error

    project = Project.find(response.structured_content[:id])
    expect(project.header_bg.file.read).to eq(fixture_path.binread)
  end
end
