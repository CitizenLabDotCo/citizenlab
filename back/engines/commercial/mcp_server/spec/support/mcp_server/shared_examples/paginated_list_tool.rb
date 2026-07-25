# frozen_string_literal: true

# Shared examples for list tools built on McpServer::BaseTool::Pagination.
#
# The including spec must define:
#   let(:current_user)  - user running the tool
#   let(:base_params)   - valid params, without :page / :per_page
#   let(:create_record) - proc creating ONE record in the listed scope
#                         (the scope must otherwise be empty)
#
#   it_behaves_like 'a paginated list tool'
RSpec.shared_examples 'a paginated list tool' do
  describe 'pagination' do
    before { 3.times { create_record.call } }

    it 'returns the data and pagination envelope with defaults' do
      response = run_mcp_tool(described_class, params: base_params, current_user:)

      expect(response).not_to be_error
      expect(response.structured_content[:data]).to be_an(Array)
      expect(response.structured_content[:pagination]).to eq(
        page: 1,
        per_page: McpServer::BaseTool::Pagination::DEFAULT_PER_PAGE,
        total_count: 3,
        total_pages: 1
      )
    end

    it 'serves subsequent pages' do
      params = base_params.merge(page: 2, per_page: 2)
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response).not_to be_error
      expect(response.structured_content[:data].size).to eq(1)
      expect(response.structured_content[:pagination]).to eq(
        page: 2, per_page: 2, total_count: 3, total_pages: 2
      )
    end

    it 'clamps per_page to MAX_PER_PAGE' do
      params = base_params.merge(per_page: 999)
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response.structured_content.dig(:pagination, :per_page))
        .to eq(McpServer::BaseTool::Pagination::MAX_PER_PAGE)
    end
  end
end
