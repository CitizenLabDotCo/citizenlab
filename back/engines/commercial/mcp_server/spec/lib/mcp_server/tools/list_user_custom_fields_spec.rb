# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListUserCustomFields do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists registration fields in display order' do
    field_a = create(:custom_field)
    field_b = create(:custom_field)
    field_b.move_to_top

    response = list

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([field_b.id, field_a.id])
  end

  it 'serializes exactly id, title_multiloc, input_type, code and required' do
    create(:custom_field)

    response = list

    expect(response.structured_content[:data].first.keys)
      .to match_array(%i[id title_multiloc input_type code required])
  end

  it_behaves_like 'a paginated list tool'

  it 'excludes disabled and hidden fields' do
    enabled_field = create(:custom_field)
    create(:custom_field, enabled: false)
    create(:custom_field, hidden: true)

    response = list

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([enabled_field.id])
  end
end
