# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::NumericFieldCounter do
  subject(:counter) { described_class.new }

  describe '.bin_data' do
    where do
      {
        'closed_ended_bins' => {
          counts: (1..100).to_a.index_with(1),
          bins: [0, 10, 50, 100.1],
          expected_result: [9, 40, 51]
        },
        'counts_out_of_range_below' => {
          counts: { -5 => 2, 1 => 1, 6 => 2, 15 => 3 },
          bins: [0, 10, 20],
          expected_result: [3, 3] # -5 is ignored, values < 0 not counted
        },
        'counts_at_boundaries' => {
          counts: { 10 => 1, 20 => 5, 30 => 3 },
          bins: [10, 20, 30, 40],
          expected_result: [1, 5, 3] # Each boundary value goes in its bin
        },
        'empty_bins' => {
          counts: { 1 => 1, 7 => 2 },
          bins: [2, 4, 5, 6],
          expected_result: [0, 0, 0] # No values fall in these ranges
        },
        'single_value_multiple_counts' => {
          counts: { 25 => 10 },
          bins: [0, 20, 30, 40],
          expected_result: [0, 10, 0] # All 10 counts in middle bin
        },
        'negative_values' => {
          counts: { -10 => 2, -5 => 3, 0 => 1, 5 => 4 },
          bins: [-15, -7, 0, 10],
          expected_result: [2, 3, 5] # Handles negative ranges properly  
        },
        'decimal_values' => {
          counts: { 1.5 => 2, 2.7 => 3, 4.1 => 1 },
          bins: [0, 2, 3, 5],
          expected_result: [2, 3, 1] # Handles decimal values
        },
        'decimal_bins' => {
          counts: { 1.2 => 3, 2.8 => 5, 3.1 => 2, 4.7 => 4, 5.9 => 1 },
          bins: [1.0, 2.5, 3.5, 4.5, 6.0],
          expected_result: [3, 7, 0, 5] # Values distributed across decimal boundaries
        },
        'max_value_edge_case' => {
          counts: { 5 => 1, 10 => 2, 15 => 3 },
          bins: [0, 10, 15.01], # Max value should be included
          expected_result: [1, 5] # 10 and 15 both in second bin
        },
        'realistic_income_data' => {
          counts: { 25000 => 5, 45000 => 8, 75000 => 12, 95000 => 3, 120000 => 2 },
          bins: [0, 50000, 100000, 150000],
          expected_result: [13, 15, 2] # Income distribution across salary ranges
        }
      }
    end

    with_them do
      it do
        binned_data = counter.send(:bin_data, counts, bins)
        expect(binned_data).to eq(expected_result)
      end
    end
  end

  describe '.calculate_closed_bins' do
    it 'creates 10 evenly spaced bins' do
      values = [10, 20, 30, 40, 50]
      bins = counter.send(:calculate_closed_bins, values, 5)
      
      expect(bins.length).to eq(6) # 5 bins = 6 boundaries
      expect(bins.first).to eq(10) # Starts at min
      expect(bins.last).to be > 50 # Ends beyond max to include it
    end

    it 'handles single value' do
      values = [42]
      bins = counter.send(:calculate_closed_bins, values, 10)
      
      expect(bins).to eq([42, 43]) # Simple increment for single value
    end

    it 'handles negative values' do
      values = [-20, -10, 0, 10, 20]
      bins = counter.send(:calculate_closed_bins, values, 4)
      
      expect(bins.first).to eq(-20) # Starts at min
      expect(bins.last).to be > 20 # Ends beyond max
      expect(bins.length).to eq(5) # 4 bins = 5 boundaries
    end

    it 'handles empty values' do
      values = []
      bins = counter.send(:calculate_closed_bins, values, 10)
      
      expect(bins).to eq([0, 10]) # Default fallback
    end
  end

  describe '#count' do
    let(:custom_field_income) { create(:custom_field_number, key: 'income') }
    let(:records_or_values) do
      [
        { 'income' => '25000' },
        { 'income' => '75000' },
        { 'income' => '125000' },
        { 'income' => nil }, # Unknown value
        { 'income' => '50000' }
      ]
    end

    it 'counts values with dynamic binning' do
      result = counter.count(records_or_values, custom_field_income)
      
      expect(result.binned_counts.sum).to eq(4) # 4 known values
      expect(result.unknown_count).to eq(1) # 1 blank value
      expect(result.bins.first).to eq(25000.0) # Starts at min value
      expect(result.bins.last).to be > 125000 # Ends beyond max value
    end

    it 'uses provided bins when given' do
      custom_bins = [0, 50000, 100000, 150000]
      result = counter.count(records_or_values, custom_field_income, custom_bins)
      
      expect(result.bins).to eq(custom_bins)
      expect(result.binned_counts).to eq([1, 2, 1]) # Distributed across provided bins
    end

    it 'handles empty data' do
      empty_data = [{ 'income' => '' }, { 'income' => nil }]
      result = counter.count(empty_data, custom_field_income)
      
      expect(result.binned_counts).to eq([0]) # Single empty bin
      expect(result.unknown_count).to eq(2) # All values unknown
    end
  end
end
