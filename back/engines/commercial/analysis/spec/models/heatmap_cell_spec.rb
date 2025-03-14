# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::HeatmapCell do
  subject { heatmap_cell }

  let(:heatmap_cell) { build(:heatmap_cell) }

  describe 'Default factory' do
    it { is_expected.to be_valid }
  end

  describe 'statement_multiloc' do
    it 'generates a human readable multiloc string' do
      heatmap_cell = build(:heatmap_cell, row: create(:tag, name: 'Environment'))
      expect(heatmap_cell.statement_multiloc).to eq({
        'en' => "People who respond 'youth council' to 'Member of councils?' post content in Environment 10% more than average."
      })
    end
  end
end
