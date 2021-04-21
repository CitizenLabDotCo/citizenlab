module AcceptanceHelper
  def json_response_body
    json_parse(response_body)
  end

  def response_data
    json_response_body[:data]
  end

  def response_ids
    response_data.map { |record| record[:id] }
  end

  def response_length
    response_data.length
  end

  def response_relationships_for(id)
    response_data.find { |record| record[:id] == id }&.fetch(:relationships)
  end

  def response_error
    json_response_body[:error]
  end

  def response_errors_for(error_resource, error_key)
    json_response_body[:errors][error_resource]&.select { |error| error[:error].to_s == error_key.to_s }
  end
end
