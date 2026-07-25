# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateProject do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }

  it 'updates the header background from a remote URL' do
    remote_url = 'https://example.com/header.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run_mcp_tool(
      described_class,
      params: { project_id: project.id, remote_header_bg_url: remote_url },
      current_user:
    )

    expect(response).not_to be_error
    expect(project.reload.header_bg.file.read).to eq(fixture_path.binread)
  end

  it 'updates only the given attributes' do
    response = nil
    expect { response = run_mcp_tool(described_class, params: { project_id: project.id, listed: false }, current_user:) }
      .to change { project.reload.listed }.to(false)
      .and not_change { project.reload.title_multiloc }

    expect(response).not_to be_error
  end

  it 'returns the serialized project with merged multiloc fields' do
    project.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancien' })

    response = run_mcp_tool(
      described_class,
      params: { project_id: project.id, title_multiloc: { 'en' => 'New' } },
      current_user:
    )

    expect(response).not_to be_error
    expect(response.structured_content[:id]).to eq(project.id)
    expect(response.structured_content[:title_multiloc]).to eq('en' => 'New', 'fr-FR' => 'Ancien')
  end

  it 'returns structured validation errors for an invalid update' do
    response = run_mcp_tool(
      described_class,
      params: { project_id: project.id, visible_to: 'everybody' },
      current_user:
    )

    expect(response).to be_error
    expect(response.structured_content[:errors].pluck(:attribute)).to include('visible_to')
    expect(project.reload.visible_to).to eq('public')
  end

  it 'refuses when the project is published' do
    published = create(:project, admin_publication_attributes: { publication_status: 'published' })

    response = nil
    expect { response = run_mcp_tool(described_class, params: { project_id: published.id, title_multiloc: { 'en' => 'New' } }, current_user:) }
      .not_to change { published.reload.title_multiloc }

    expect(response).to be_unauthorized_project
  end

  it 'returns a not-found error when the project is missing' do
    response = run_mcp_tool(
      described_class,
      params: { project_id: SecureRandom.uuid, title_multiloc: { 'en' => 'New' } },
      current_user:
    )

    expect(response).to be_not_found('Project')
  end
end
