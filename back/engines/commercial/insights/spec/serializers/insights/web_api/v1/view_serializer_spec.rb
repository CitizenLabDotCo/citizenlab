# frozen_string_literal: true

require 'rails_helper'

describe Insights::WebApi::V1::ViewSerializer do
  let(:view) { create(:view) }
  let(:expected_serialization) do
    {
      data: {
        id: view.id,
        type: :view,
        attributes: {
          name: view.name,
          updated_at: view.updated_at
        },
        relationships: {
          data_sources: {
            data: [{ id: view.data_sources.first.origin_id, type: :project }]
          }
        }
      }
    }
  end

  # This could be improved using json-schema validation.
  it { expect(described_class.new(view).serializable_hash).to match(expected_serialization) }
end
