# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::CustomFieldSerializer do
  let_it_be(:field, reload: true) { create(:custom_field_point, :for_custom_form, key: 'extra') }
  let_it_be(:map_config, reload: true) { create(:map_config, mappable: field) }

  it 'serializes the relationship with a map_config related to the field' do
    params = { params: { constraints: {}, supports_answer_visible_to: true } }
    serialized_field = described_class.new(field, params).serializable_hash
    relationships = serialized_field[:data][:relationships]

    expect(relationships).to include(map_config: { data: { id: map_config.id.to_s, type: :map_config } })
  end
end
