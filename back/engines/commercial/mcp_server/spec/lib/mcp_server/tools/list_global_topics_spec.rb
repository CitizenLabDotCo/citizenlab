# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListGlobalTopics do
  let(:current_user) { create(:super_admin) }

  it 'lists global topics in display order' do
    topic_a = create(:global_topic)
    topic_b = create(:global_topic)
    topic_b.move_to_top

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([topic_b.id, topic_a.id])
  end

  it 'serializes topic fields' do
    create(:global_topic)

    response = run_mcp_tool(described_class, params: {}, current_user:)

    expect(response.structured_content[:data].first)
      .to include(:title_multiloc, :icon, :ordering)
  end

  it_behaves_like 'a paginated list tool' do
    let(:base_params) { {} }
    let(:create_record) { -> { create(:global_topic) } }
  end
end
