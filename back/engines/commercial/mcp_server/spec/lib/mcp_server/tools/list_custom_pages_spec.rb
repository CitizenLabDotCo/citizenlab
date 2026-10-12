# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListCustomPages do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists global custom pages, excluding built-in and project-scoped pages' do
    custom = create(:static_page, code: 'custom')
    builtin = create(:static_page, code: 'about', slug: 'about')
    project_scoped = create(:static_page, :project_scoped, code: 'custom')

    response = list

    expect(response).not_to be_error
    ids = response.structured_content[:data].pluck(:id)
    expect(ids).to include(custom.id)
    expect(ids).not_to include(builtin.id, project_scoped.id)

    expect(response.structured_content[:data].find { |d| d[:id] == custom.id })
      .to include(title_multiloc: custom.title_multiloc, slug: custom.slug)
  end

  it_behaves_like 'a paginated list tool'
end
