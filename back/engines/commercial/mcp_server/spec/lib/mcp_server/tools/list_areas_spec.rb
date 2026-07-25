# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListAreas do
  let(:current_user) { create(:super_admin) }

  it 'lists areas in display order' do
    area_a = create(:area)
    area_b = create(:area)
    area_b.move_to_top

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([area_b.id, area_a.id])
  end

  it 'serializes area fields' do
    create(:area)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :description_multiloc, :ordering)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { {} }
    let(:create_record) { -> { create(:area) } }
  end
end
