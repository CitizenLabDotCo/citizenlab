# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListEvents do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project) }

  it 'lists events of the project ordered by start date' do
    later_event = create(:event, project:, start_at: '2030-03-01', end_at: '2030-03-01 02:00')
    earlier_event = create(:event, project:, start_at: '2030-01-01', end_at: '2030-01-01 02:00')
    create(:event) # event in another project

    response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([earlier_event.id, later_event.id])
  end

  it 'serializes event fields' do
    create(:event, project:)

    response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :start_at, :project_id)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { project_id: project.id } }
  end

  it 'returns an empty list when the project does not exist' do
    response = run_mcp_tool(described_class, params: { project_id: SecureRandom.uuid }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data]).to eq([])
  end
end
