# frozen_string_literal: true

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
