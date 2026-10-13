# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListAdminPublications do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists non-draft projects and folders with their publication info' do
    project = create(:project) # published by default
    folder = create(:project_folder)
    draft = create(:project, admin_publication_attributes: { publication_status: 'draft' })

    response = list

    expect(response).not_to be_error
    data = response.structured_content[:data]
    expect(data.pluck(:id)).to include(project.admin_publication.id, folder.admin_publication.id)
    expect(data.pluck(:id)).not_to include(draft.admin_publication.id)

    entry = data.find { |d| d[:id] == project.admin_publication.id }
    expect(entry).to include(
      publication_type: 'Project',
      publication_status: 'published',
      title_multiloc: project.title_multiloc,
      slug: project.slug
    )
    folder_entry = data.find { |d| d[:id] == folder.admin_publication.id }
    expect(folder_entry[:publication_type]).to eq('ProjectFolders::Folder')
  end

  it_behaves_like 'a paginated list tool'
end
