# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::WebApi::V1::BinnedDistributionSerializer do
  subject(:serializer) { described_class.new(distribution) }

  let(:distribution) { create(:binned_distribution) }

  describe '#serializable_hash' do
    specify do
      expect(serializer.serializable_hash).to match(
        data: {
          id: be_a(String),
          type: :binned_distribution,
          attributes: {
            distribution: {
              'bins' => distribution.bin_boundaries,
              'counts' => distribution.counts
            }
          }
        }
      )
    end
  end
end
