# frozen_string_literal: true

require 'rails_helper'

describe McpServer::BaseTool::Pagination do
  subject(:host) { Class.new { include McpServer::BaseTool::Pagination }.new }

  let_it_be(:areas) { create_list(:area, 3) }
  let_it_be(:current_user) { create(:super_admin) }

  let(:scope) { Area.order(:ordering) }

  def paginate(**options)
    host.paginated_response(
      'areas', scope,
      page: nil, per_page: nil,
      serializer: McpServer::Serializers::Area, params: { current_user: },
      **options
    )
  end

  it 'returns the data and pagination envelope with defaults' do
    response = paginate

    expect(response).not_to be_error
    expect(response.structured_content).to match(
      data: have_attributes(size: 3),
      pagination: {
        page: 1,
        per_page: described_class::DEFAULT_PER_PAGE,
        total_count: 3,
        total_pages: 1
      }
    )
  end

  it 'summarizes the result in the text block' do
    expect(paginate.content.first[:text])
      .to include('Found 3 areas (showing page 1, 20 per page)')
  end

  it 'serves subsequent pages' do
    response = paginate(page: 2, per_page: 2)

    expect(response.structured_content).to match(
      data: have_attributes(size: 1),
      pagination: { page: 2, per_page: 2, total_count: 3, total_pages: 2 }
    )
  end

  it 'clamps per_page between 1 and MAX_PER_PAGE' do
    per_page = paginate(per_page: 999).structured_content.dig(:pagination, :per_page)
    expect(per_page).to eq(described_class::MAX_PER_PAGE)

    per_page = paginate(per_page: 0).structured_content.dig(:pagination, :per_page)
    expect(per_page).to eq(1)
  end

  it 'serializes the records with the given serializer' do
    response = paginate

    expect(response.structured_content[:data])
      .to eq(McpServer::Serializers::Area.serialize(scope, params: { current_user: }))
  end
end
