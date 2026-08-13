# frozen_string_literal: true

require 'rails_helper'

describe McpServer::Tools::ListGlobalTopics do
  let(:current_user) { create(:super_admin) }

  def list(params = {})
    run_mcp_tool(described_class, params:, current_user:)
  end

  it 'lists global topics in display order' do
    topic_a = create(:global_topic)
    topic_b = create(:global_topic)
    topic_b.move_to_top

    response = list

    expect(response).not_to be_error
    expect(response.structured_content[:data].pluck(:id)).to eq([topic_b.id, topic_a.id])
  end

  it 'serializes topic fields' do
    create(:global_topic)

    response = list

    expect(response.structured_content[:data].sole)
      .to include(:title_multiloc, :icon, :ordering)
  end

  it_behaves_like 'a paginated list tool'
end
