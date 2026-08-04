# frozen_string_literal: true

# Shared examples for list tools built on McpServer::BaseTool::Pagination.
#
# They only verify that the tool wires `page` / `per_page` through to
# `paginated_response` — the pagination mechanics themselves are unit-tested in
# spec/lib/mcp_server/base_tool/pagination_spec.rb, and scope correctness is the
# responsibility of the tool specs.
#
# The including spec may define:
#   let(:base_params) - valid params, without :page / :per_page
# (omit it when the tool has no required params)
#
#   it_behaves_like 'a paginated list tool'
RSpec.shared_examples 'a paginated list tool' do
  describe 'pagination' do
    let(:current_user) { create(:super_admin) }
    let(:params) { respond_to?(:base_params) ? base_params : {} }

    it 'echoes page and per_page in the pagination envelope' do
      response = run_mcp_tool(described_class, params: params.merge(page: 2, per_page: 5), current_user:)

      expect(response).not_to be_error
      expect(response.structured_content[:data]).to be_an(Array)
      expect(response.structured_content[:pagination]).to include(page: 2, per_page: 5)
    end

    it 'defaults to page 1 and `DEFAULT_PER_PAGE`' do
      response = run_mcp_tool(described_class, params:, current_user:)

      expect(response.structured_content[:pagination]).to include(
        page: 1,
        per_page: McpServer::BaseTool::Pagination::DEFAULT_PER_PAGE
      )
    end

    it 'clamps `per_page` to `MAX_PER_PAGE`' do
      response = run_mcp_tool(described_class, params: params.merge(per_page: 999), current_user:)

      expect(response.structured_content.dig(:pagination, :per_page))
        .to eq(McpServer::BaseTool::Pagination::MAX_PER_PAGE)
    end
  end
end
