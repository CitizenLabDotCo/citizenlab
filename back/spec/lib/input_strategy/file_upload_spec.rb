# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::FileUpload do
  let(:custom_field) { build(:custom_field, input_type: 'file_upload') }
  let(:input_strategy) { described_class.new(custom_field) }

  describe '#supports_average?' do
    it 'returns false' do
      expect(input_strategy.supports_average?).to be false
    end
  end

  describe '#supports_options?' do
    it 'returns false' do
      expect(input_strategy.supports_options?).to be false
    end
  end

  describe '#supports_other_option?' do
    it 'returns false' do
      expect(input_strategy.supports_other_option?).to be false
    end
  end

  describe '#supports_option_images?' do
    it 'returns false' do
      expect(input_strategy.supports_option_images?).to be false
    end
  end

  describe '#supports_follow_up?' do
    it 'returns false' do
      expect(input_strategy.supports_follow_up?).to be false
    end
  end

  describe '#supports_text?' do
    it 'returns false' do
      expect(input_strategy.supports_text?).to be false
    end
  end

  describe '#supports_linear_scale?' do
    it 'returns false' do
      expect(input_strategy.supports_linear_scale?).to be false
    end
  end

  describe '#supports_linear_scale_labels?' do
    it 'returns false' do
      expect(input_strategy.supports_linear_scale_labels?).to be false
    end
  end

  describe '#supports_matrix_statements?' do
    it 'returns false' do
      expect(input_strategy.supports_matrix_statements?).to be false
    end
  end

  describe '#supports_single_selection?' do
    it 'returns false' do
      expect(input_strategy.supports_single_selection?).to be false
    end
  end

  describe '#supports_multiple_selection?' do
    it 'returns false' do
      expect(input_strategy.supports_multiple_selection?).to be false
    end
  end

  describe '#supports_selection?' do
    it 'returns false' do
      expect(input_strategy.supports_selection?).to be false
    end
  end

  describe '#supports_select_count?' do
    it 'returns false' do
      expect(input_strategy.supports_select_count?).to be false
    end
  end

  describe '#supports_dropdown_layout?' do
    it 'returns false' do
      expect(input_strategy.supports_dropdown_layout?).to be false
    end
  end

  describe '#supports_xlsx_export?' do
    it 'returns true' do
      expect(input_strategy.supports_xlsx_export?).to be true
    end
  end

  describe '#supports_geojson?' do
    it 'returns true' do
      expect(input_strategy.supports_geojson?).to be true
    end
  end
end
