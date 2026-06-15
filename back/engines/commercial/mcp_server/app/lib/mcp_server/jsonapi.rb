# frozen_string_literal: true

module McpServer::Jsonapi
  module_function

  def flatten(jsonapi, inline_rels: [])
    included_by_id = jsonapi[:included].to_a.index_by { |r| r[:id] }
    flatten_data(jsonapi[:data], included_by_id, inline_rels:)
  end

  # @param [Hash,Array<Hash>] data the data section of a JSONAPI response
  def flatten_data(data, included, inline_rels: [])
    return data.map { flatten_data(it, included, inline_rels:) } if data.is_a?(Array)

    {
      id: data[:id],
      **data[:attributes],
      **flatten_relationships(data[:relationships] || {}, included, inline_rels:)
    }
  end

  def flatten_relationships(relationships, included, inline_rels:)
    relationships.to_h do |name, relationship|
      rel_data = relationship.fetch(:data)
      many = rel_data.is_a?(Array)
      id_or_ids = many ? rel_data.pluck(:id) : rel_data&.dig(:id)

      if name.not_in?(inline_rels)
        key = many ? "#{name.to_s.singularize}_ids" : "#{name}_id"
        [key.to_sym, id_or_ids]
      elsif id_or_ids.nil?
        [name, nil]
      else
        to_be_inlined = included.fetch_values(*id_or_ids)
        flattened = flatten_data(to_be_inlined, included)
        [name, many ? flattened : flattened.sole]
      end
    end
  end

end
