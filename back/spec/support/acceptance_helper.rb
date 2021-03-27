module AcceptanceHelper
  def response_data
    json_parse(response_body)[:data]
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
end
