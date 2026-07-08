# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::Pagination do
  subject(:host) { Class.new { include McpServer::BaseTool::Pagination }.new }

  let_it_be(:areas) { create_list(:area, 3) }

  let(:scope) { Area.order(:ordering) }

  def paginate(**options)
    host.paginated_response('areas', scope, page: nil, per_page: nil, **options)
  end

  it 'returns the data and pagination envelope with defaults' do
    response = paginate

    expect(response).not_to be_error
    expect(response.structured_content[:data].size).to eq(3)
    expect(response.structured_content[:pagination]).to eq(
      page: 1,
      per_page: described_class::DEFAULT_PER_PAGE,
      total_count: 3,
      total_pages: 1
    )
  end

  it 'summarizes the result in the text block' do
    response = paginate

    expect(response.content.first[:text])
      .to include('Found 3 areas (showing page 1, 20 per page)')
  end

  it 'serves subsequent pages' do
    response = paginate(page: 2, per_page: 2)

    expect(response.structured_content[:data].size).to eq(1)
    expect(response.structured_content[:pagination]).to eq(
      page: 2, per_page: 2, total_count: 3, total_pages: 2
    )
  end

  it 'clamps per_page between 1 and MAX_PER_PAGE' do
    expect(paginate(per_page: 999).structured_content.dig(:pagination, :per_page))
      .to eq(described_class::MAX_PER_PAGE)
    expect(paginate(per_page: 0).structured_content.dig(:pagination, :per_page))
      .to eq(1)
  end

  it 'serializes with as_json options when no serializer is given' do
    response = paginate(only: %i[id])

    expect(response.structured_content[:data]).to match_array(areas.map { |a| { 'id' => a.id } })
  end

  it 'serializes with the given MCP serializer' do
    response = paginate(serializer: McpServer::Serializers::Area, params: { current_user: create(:super_admin) })

    expect(response.structured_content[:data].pluck(:id)).to eq(scope.pluck(:id))
    expect(response.structured_content[:data].first).to include(:title_multiloc)
  end
end
