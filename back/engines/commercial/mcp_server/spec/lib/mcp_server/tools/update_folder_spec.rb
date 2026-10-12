# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::UpdateFolder do
  let(:current_user) { create(:super_admin) }
  let(:folder) { create(:project_folder) }

  before { change_lifecycle_stage('demo') }

  def run(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  describe '#input_schema' do
    it "reuses create_folder's properties" do
      folder_properties = McpServer::Tools::CreateFolder.new.input_schema[:properties]
      schema = described_class.new.input_schema

      expect(schema[:properties].keys).to eq([:folder_id, *folder_properties.keys])
      expect(schema[:required]).to eq(%w[folder_id])
      expect(schema[:additionalProperties]).to be(false)
    end
  end

  it 'updates only the given attributes and merges multiloc fields' do
    folder.update!(title_multiloc: { 'en' => 'Old', 'fr-FR' => 'Ancien' })

    response = nil
    expect { response = run(folder_id: folder.id, title_multiloc: { 'en' => 'New' }) }
      .to not_change { folder.reload.description_preview_multiloc }

    expect(response).not_to be_error
    expect(folder.reload.title_multiloc).to eq('en' => 'New', 'fr-FR' => 'Ancien')
    expect(response.structured_content).to include(
      id: folder.id,
      title_multiloc: { 'en' => 'New', 'fr-FR' => 'Ancien' }
    )
  end

  it 'updates the header background from a remote URL' do
    remote_url = 'https://example.com/header.jpg'
    fixture_path = stub_remote_image_download(remote_url)

    response = run(folder_id: folder.id, remote_header_bg_url: remote_url)

    expect(response).not_to be_error
    expect(folder.reload.header_bg.file.read).to eq(fixture_path.binread)
  end

  it 'removes the header background when remote_header_bg_url is null' do
    stub_remote_image_download('https://example.com/header.jpg')
    folder.update!(remote_header_bg_url: 'https://example.com/header.jpg')

    response = nil
    expect { response = run(folder_id: folder.id, remote_header_bg_url: nil) }
      .to change { folder.reload.header_bg.file }.to(nil)

    expect(response).not_to be_error
  end

  it 'logs the folder change' do
    expect { run(folder_id: folder.id, title_multiloc: { 'en' => 'New' }) }
      .to have_enqueued_job(LogActivityJob).at_least(:once)
  end

  it 'returns structured validation errors for an invalid update' do
    folder.update!(title_multiloc: { 'en' => 'Old' })

    response = run(folder_id: folder.id, title_multiloc: { 'en' => '' })

    expect(response).to be_error
    expect(response.structured_content[:errors]).to be_present
  end

  it 'refuses outside demo and trial platforms, even for draft folders' do
    change_lifecycle_stage('active')
    draft_folder = create(:project_folder, admin_publication_attributes: { publication_status: 'draft' })

    response = nil
    expect { response = run(folder_id: draft_folder.id, title_multiloc: { 'en' => 'New' }) }
      .not_to change { draft_folder.reload.title_multiloc }

    expect(response).to be_error
    expect(response.content.sole[:text]).to include('demo and trial')
  end

  it 'refuses non-admin users' do
    response = run_mcp_tool(
      described_class,
      params: { folder_id: folder.id, title_multiloc: { 'en' => 'New' } },
      current_user: create(:user)
    )

    expect(response).to be_error
  end

  it 'returns a not-found error when the folder is missing' do
    response = run(folder_id: SecureRandom.uuid, title_multiloc: { 'en' => 'New' })

    expect(response).to be_not_found('Folder')
  end
end
