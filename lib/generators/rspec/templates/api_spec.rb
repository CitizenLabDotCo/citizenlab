require 'rails_helper'

RSpec.describe "<%= class_name %> API", type: :request do
  before :each do
    host! "example.org"
  end

  def endpoint_url
    "/api/v1/<%= file_name.pluralize %>"
  end

  def endpoint_url_with_id(id)
    "/api/v1/<%= file_name.pluralize %>/#{id}"
  end

  xcontext "list" do
    it 'returns the list of all records' do
      create_<%= file_name %>
      get endpoint_url

      assert_status(200)
      json_response = json_parse(response.body)
      assert_count(json_response, 1)
      expect(json_response[:data].first[:attributes][:attribute_1]).to eq('value_1')
    end

    it "returns an empty array if no records are found" do
      get endpoint_url

      expect(response.status).to eq(200)
      json_response = json_parse(response.body)
      expect(json_response[:data]).to eq([])
    end
  end

  xcontext "get" do
    it 'returns a record by id' do
      <%= file_name %> = create_<%= file_name %>
      get endpoint_url_with_id(<%= file_name %>.id)

      assert_status(200)
      json_response = json_parse(response.body)
      expect(json_response[:data][:attributes][:attribute_1]).to eq('value_1')
    end

    it "returns 404 response if record not found" do
      get endpoint_url_with_id(123)

      assert_status(404)
    end
  end

  xcontext "insert" do
    it "returns 201 response if successful" do
      # set params for the create request
      <%= file_name %>_params = { attribute_1: 'value_1' }
      post endpoint_url, params: { <%= file_name %>: <%= file_name %>_params }

      assert_status(201)
      json_response = json_parse(response.body)
      expect(json_response[:data][:id]).to_not be_nil
    end

    it "returns 400 response if failed to create" do
      # set some invalid data for the request
      <%= file_name %>_params = {attribute_1: ''}
      post endpoint_url, params: { <%= file_name %>: <%= file_name %>_params }

      json_response = json_parse(response.body)
      expect(json_response).to_not be_empty
      assert_status(400)
    end
  end

  xcontext "patch" do
    it "returns 200 response if successful"  do
      <%= file_name %> = create_<%= file_name %>
      # set params for the update request
      <%= file_name %>_params = {attribute_1: 'updated_value_1'}
      patch endpoint_url_with_id(<%= file_name %>.id), params: { <%= file_name %>: <%= file_name %>_params }

      assert_status(200)
      # assert updated data
      expect(<%= file_name %>.reload.attribute_1).to eq('updated_value_1')
    end

    it "returns 400 response if failed to update" do
      <%= file_name %> = create_<%= file_name %>
      # set some invalid data for the request
      <%= file_name %>_params = {attribute_1: ''}
      patch endpoint_url_with_id(<%= file_name %>.id), params: { <%= file_name %>: <%= file_name %>_params }

      assert_status(400)
    end

    it "returns 404 response if record not found" do
      patch endpoint_url_with_id(123), params: { <%= file_name %>: {} }
      assert_status(404)
    end
  end

  xcontext "delete" do
    it "returns 204 response if successful"  do
      <%= file_name %> = create_<%= file_name %>
      delete endpoint_url_with_id(<%= file_name %>.id)

      assert_status(204)
      all_<%= file_name.pluralize %> = <%= class_name %>.all
      expect(all_<%= file_name.pluralize %>.count).to eq(0)
    end

    it "returns 404 response if record not found" do
      delete endpoint_url_with_id(123)
      assert_status(404)
    end
  end

  private
  def create_<%= file_name %>
    raise NotImplementedError
    # TODO:
    # FactoryGirl.create(:<%= file_name.singularize %>, attribute_1: 'value_1')
  end
end
