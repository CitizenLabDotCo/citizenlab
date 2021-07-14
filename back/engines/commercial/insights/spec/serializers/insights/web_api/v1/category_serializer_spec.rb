# frozen_string_literal: true

require 'rails_helper'

describe Insights::WebApi::V1::CategorySerializer do
  let(:category) { create(:category) }
  let(:expected_serialization) do
    {
      data: {
        id: category.id,
        type: :category,
        attributes: {
          name: category.name,
          inputs_count: category.inputs_count
        },
        relationships: {
          view: {
            data: { id: category.view.id, type: :view }
          }
        }
      }
    }
  end

  it { expect(described_class.new(category).serializable_hash).to match(expected_serialization) }
end
