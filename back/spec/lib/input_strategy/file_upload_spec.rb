# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::FileUpload do
  let(:custom_field) { build(:custom_field, input_type: 'file_upload') }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_xlsx_export?' do
    it 'returns false' do
      expect(input_strategy.supports_xlsx_export?).to be false
    end
  end
end
