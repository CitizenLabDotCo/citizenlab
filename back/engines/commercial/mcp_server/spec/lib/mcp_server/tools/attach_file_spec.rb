# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::AttachFile do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project, :draft) }
  let(:remote_url) { 'https://example.com/file.pdf' }
  let!(:fixture_path) { stub_remote_file_download(remote_url) }

  context 'with a remote_url' do
    it 'uploads and attaches the file to a project' do
      response = run_mcp_tool(
        described_class,
        params: { container_type: 'Project', container_id: project.id, remote_url: remote_url, name: 'doc.pdf' },
        current_user:
      )

      expect(response).not_to be_error

      attachment = Files::FileAttachment.find(response.structured_content[:id])
      expect(attachment.attachable).to eq(project)
      expect(attachment.file.content.file.read).to eq(fixture_path.binread)
      expect(attachment.file.projects).to include(project)
    end

    it 'uploads and attaches the file to a phase' do
      phase = create(:phase, project: project)

      response = run_mcp_tool(
        described_class,
        params: { container_type: 'Phase', container_id: phase.id, remote_url: remote_url, name: 'doc.pdf' },
        current_user:
      )

      expect(response).not_to be_error

      attachment = Files::FileAttachment.find(response.structured_content[:id])
      expect(attachment.attachable).to eq(phase)
      expect(attachment.file.projects).to include(project)
    end
  end

  context 'with a file_id' do
    let(:existing_file) { create(:file, projects: [project]) }

    it 'reuses an existing project file' do
      response = run_mcp_tool(
        described_class,
        params: { container_type: 'Project', container_id: project.id, file_id: existing_file.id },
        current_user:
      )

      expect(response).not_to be_error
      attachment = Files::FileAttachment.find(response.structured_content[:id])
      expect(attachment.file).to eq(existing_file)
    end

    it "refuses when the file is not one of the container's project files" do
      other_project = create(:project, :draft)
      other_file = create(:file, projects: [other_project])

      response = run_mcp_tool(
        described_class,
        params: { container_type: 'Project', container_id: project.id, file_id: other_file.id },
        current_user:
      )

      expect(response).to be_error
      expect(response.content.first[:text]).to match(/not one of the container's project files/)
    end
  end

  it 'refuses when the project is published' do
    published = create(:project, admin_publication_attributes: { publication_status: 'published' })

    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Project', container_id: published.id, remote_url: remote_url, name: 'doc.pdf' },
      current_user:
    )

    expect(response).to be_unauthorized_project
    expect(Files::FileAttachment.where(attachable: published).count).to eq(0)
  end

  it 'returns a not-found error when the container is missing' do
    response = run_mcp_tool(
      described_class,
      params: { container_type: 'Project', container_id: SecureRandom.uuid, remote_url: remote_url },
      current_user:
    )

    expect(response).to be_error
    expect(response.content.first[:text]).to match(/Couldn't find Project/)
  end
end
