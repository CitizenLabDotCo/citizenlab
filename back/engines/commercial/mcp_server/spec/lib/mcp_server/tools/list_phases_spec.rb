# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListPhases do
  let(:current_user) { create(:super_admin) }
  let(:project) { create(:project) }

  it 'lists phases of the project ordered by start date' do
    later_phase = create(:phase, project:, start_at: '2030-03-01', end_at: '2030-03-20')
    earlier_phase = create(:phase, project:, start_at: '2030-01-01', end_at: '2030-01-20')
    create(:phase) # phase in another project

    response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([earlier_phase.id, later_phase.id])
  end

  it 'serializes summary fields' do
    create(:phase, project:)

    response = run_mcp_tool(described_class, params: { project_id: project.id }, current_user:)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :participation_method, :start_at)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { { project_id: project.id } }
    let(:create_record) do
      months = (1..).each
      lambda do
        month = months.next
        create(:phase, project:, start_at: Date.new(2030, month, 1), end_at: Date.new(2030, month, 20))
      end
    end
  end

  it 'returns a not-found error when the project is missing' do
    response = run_mcp_tool(described_class, params: { project_id: SecureRandom.uuid }, current_user:)

    expect(response).to be_not_found('Project')
  end
end
