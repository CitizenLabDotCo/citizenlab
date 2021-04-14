module ApiHelper
  def set_api_content_type
    header 'Content-Type', 'application/json'
  end

  def json_parse(body)
    JSON.parse(body, symbolize_names: true)
  end

  def assert_status(code)
    expect(response.status).to eq(code)
  end

  def assert_count(json_response, expected)
    expect(json_response[:data].count).to eq(expected)
  end
end

# RSpec.configure do |config|
#   config.include ApiHelper
# end
