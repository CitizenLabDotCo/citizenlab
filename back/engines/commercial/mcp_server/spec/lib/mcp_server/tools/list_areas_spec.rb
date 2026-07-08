# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListAreas do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists areas in display order' do
    area_a = create(:area)
    area_b = create(:area)
    # Make display order diverge from creation order, so the assertion can tell
    # :ordering apart from insertion order.
    area_b.move_to_top

    response = list

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([area_b.id, area_a.id])
  end

  it 'serializes area fields' do
    create(:area)

    response = list

    expect(response.structured_content[:data].sole).to include(
      :title_multiloc,
      :description_multiloc,
      :ordering
    )
  end

  it_behaves_like 'a paginated list tool'
end
