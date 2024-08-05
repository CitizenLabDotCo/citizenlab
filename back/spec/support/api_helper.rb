# frozen_string_literal: true

module ApiHelper
  def set_api_content_type
    header 'Content-Type', 'application/json'
  end

  def assert_status(code)
    expect(status).to eq code
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

  def response_jwt_cookie
    jwt = response_headers['Set-Cookie'].split(';')[0][8..-1]
    JWT.decode(jwt, nil, false).first
  end
end
