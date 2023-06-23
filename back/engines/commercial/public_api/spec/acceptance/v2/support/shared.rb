# frozen_string_literal: true

RSpec.shared_context 'common_auth' do
  before do
    api_token = PublicApi::ApiClient.create
    token = AuthToken::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  authentication :apiKey, 'Authorization header', name: 'Authorization', description: 'JWT token provided by the authentication endpoint'
end

RSpec.shared_context 'common_list_params' do
  parameter :locale, 'Which locale to return text for any multi-locale fields. For example: "en" or "fr-BE". If not provided, it will be set to the default language of the platform.', in: :query, type: 'string', required: false
  parameter :page_size, 'The number of items that should be returned in one response. Defaults to 12, max 24', in: :query, required: false, type: 'integer'
  parameter :page_number, 'The page to return. Defaults to page 1', in: :query, required: false, type: 'integer'
  parameter :created_at, 'Date the item was created - in format "YYYY-DD-MM" - to filter between two dates separate with comma', in: :query, required: false, type: 'string'
  parameter :updated_at, 'Date item was last updated - in format "YYYY-DD-MM" - to filter between two dates separate with comma', in: :query, required: false, type: 'string'
end

RSpec.shared_context 'common_item_params' do
  parameter :locale, 'Which locale to return text for any multi-locale fields. For example: "en" or "fr-BE". If not provided, it will be set to the default language of the platform.', in: :query, type: 'string', required: false
  # TODO: Appearing twice in docs if described here too
  parameter :id, 'Unique uuid for the item', in: :path, required: true, type: 'integer'
end

RSpec.shared_examples 'filtering_by_date' do |factory, date_attribute, resource_type = factory|
  context "when filtering by '#{date_attribute}'" do
    # The tests in this context will typically simulate two requests: one before and one
    # after a code block that creates new resources. The tests will then make assertions
    # about the differences between the two responses. With this approach, we don't have
    # to make any assumptions about the state of the DB and resources already existing
    # before running the tests.

    define_method(:create_resource) do |date|
      resource = create(factory, date_attribute => date)

      # Sometimes, the factory is unable to set the date correctly due to certain
      # callbacks (e.g., :updated_at).
      if resource.public_send(date_attribute) != date
        resource.update!(date_attribute => date)
      end

      resource
    end

    def compute_new_ids(root_key)
      do_request
      ids_before = json_response_body[root_key].pluck(:id)

      yield

      do_request
      ids_after = json_response_body[root_key].pluck(:id)
      ids_after - ids_before
    end

    let(date_attribute) { '2020-01-01,2020-01-02' }

    before do
      # Just another resource that should not be returned
      create_resource('2020-01-03')
    end

    resource_name = resource_type.to_s.split('/').last.tr('_', ' ').pluralize
    example_request "Lists #{resource_name} between the given dates" do
      root_key = resource_type.to_s.pluralize.to_sym

      expected_new_ids = nil
      new_ids = compute_new_ids(root_key) do
        expected_new_ids = [
          create_resource('2020-01-01'),
          create_resource('2020-01-02')
        ].map(&:id)
      end

      assert_status 200
      expect(new_ids).to match_array(expected_new_ids)
    end
  end
end

