# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::WebApi::V1::CategoricalDistributionSerializer do
  subject(:serializer) { described_class.new(distribution) }

  let(:distribution) { create(:categorical_distribution) }

  describe '#serializable_hash' do
    specify do
      expect(serializer.serializable_hash).to match(
        data: {
          id: be_a(String),
          type: :categorical_distribution,
          attributes: {
            distribution: distribution.probabilities_and_counts
          },
          relationships: {
            values: {
              data: distribution.options.map do |option|
                { id: option.id, type: :custom_field_option }
              end
            }
          }
        }
      )
    end
  end
end
