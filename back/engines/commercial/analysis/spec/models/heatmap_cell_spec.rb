# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::HeatmapCell do
  subject { heatmap_cell }

  let(:heatmap_cell) { build(:heatmap_cell, **options) }
  let(:options) { {} }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end
end
