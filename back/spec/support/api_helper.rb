# frozen_string_literal: true

module ApiHelper
  def set_api_content_type
    header 'Content-Type', 'application/json'
  end

  def assert_status(code)
    expect(status).to eq Rack::Utils.status_code(code)
  end

  def json_parse(body)
    JSON.parse(body, symbolize_names: true)
  end

  def json_response_body
    json_parse(response_body)
  end

  def response_data
    json_response_body[:data]
  end

  def response_ids
    response_data.pluck(:id)
  end
end
