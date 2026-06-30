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

    project = Project.find(response.structured_content['id'])
    expect(project.admin_publication.publication_status).to eq('draft')
  end
end
