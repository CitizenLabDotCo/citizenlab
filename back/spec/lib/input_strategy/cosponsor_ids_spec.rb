# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::CosponsorIds do
  let(:custom_field) { build(:custom_field, input_type: 'cosponsor_ids') }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_xlsx_export?' do
    it 'returns false' do
      expect(input_strategy.supports_xlsx_export?).to be false
    end
  end
end
