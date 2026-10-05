# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::CreateFolder do
  let(:current_user) { create(:super_admin) }

  def create_folder(params)
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'creates a draft folder' do
    response = create_folder(
      title_multiloc: { 'en' => 'Mobility' },
      description_preview_multiloc: { 'en' => '<p>Projects about getting around.</p>' }
    )

    expect(response).not_to be_error
    folder = ProjectFolders::Folder.find(response.structured_content[:id])
    expect(folder.title_multiloc).to eq('en' => 'Mobility')
    expect(folder.description_preview_multiloc).to eq('en' => '<p>Projects about getting around.</p>')
    # Created as a draft (not the 'published' admin_publication default).
    expect(folder.admin_publication.publication_status).to eq('draft')
  end

  it 'logs a created activity' do
    expect { create_folder(title_multiloc: { 'en' => 'Mobility' }) }
      .to have_enqueued_job(LogActivityJob)
  end

  it 'refuses a blank title' do
    response = nil
    expect { response = create_folder(title_multiloc: {}) }.not_to change(ProjectFolders::Folder, :count)
    expect(response).to be_error
  end

  it 'refuses non-admin users' do
    response = nil
    expect do
      response = run_mcp_tool(
        described_class,
        params: { title_multiloc: { 'en' => 'Mobility' } },
        current_user: create(:user)
      )
    end.not_to change(ProjectFolders::Folder, :count)
    expect(response).to be_error
  end
end
