# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::HeatmapCell do
  subject { heatmap_cell }

  let(:heatmap_cell) { build(:heatmap_cell, **options) }
  let(:options) { {} }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'row_bin_value' do
    context 'when set and row is a CustomFieldOption' do
      let(:options) { { row_bin_value: 1, row: build(:custom_field_option) } }

      it { is_expected.to be_invalid }
    end

    context 'when not set and row is a CustomField' do
      let(:options) { { row_bin_value: nil, row: build(:custom_field) } }

      it { is_expected.to be_invalid }
    end

    context 'when set and row is a CustomField' do
      let(:options) { { row_bin_value: 1, row: build(:custom_field) } }

      it { is_expected.to be_valid }
    end
  end
end
