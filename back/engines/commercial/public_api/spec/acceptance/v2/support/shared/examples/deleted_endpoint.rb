# frozen_string_literal: true

# @example
#   include_examples '/api/v2/.../deleted', :ideas
RSpec.shared_examples '/api/v2/.../deleted' do |collection, options = {}|
  item_type = options[:item_type] || collection.to_s.singularize.classify

  get "/api/v2/#{collection}/deleted" do
    parameter(
      :deleted_at,
      'Date item was deleted - in format "YYYY-DD-MM" - to filter between two dates separate with comma',
      in: :query,
      required: false,
      type: 'string'
    )

    let!(:deletion_activities) do
      %w[2020-01-01 2020-01-02].map do |date|
        create(:activity, item_type: item_type, action: 'deleted', acted_at: date)
      end
    end

    example_request "List deleted #{collection}" do
      assert_status 200

      expected_items = deletion_activities.map do |activity|
        {
          id: activity.item_id,
          type: item_type,
          deleted_at: activity.acted_at.iso8601(3)
        }
      end

      expect(json_response_body[:deleted_items]).to match_array(expected_items)
    end

    context "when filtering by 'deleted_at'" do
      let(:deleted_at) { '2020-01-02,2020-01-31' }

      example_request "List only the #{collection} deleted during the specified period" do
        assert_status 200
        expect(json_response_body[:deleted_items].size).to eq(1)
      end
    end
  end
end
