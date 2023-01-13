# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::AgeCounter do
  subject(:counter) { described_class.new }

  describe '.bin_data' do
    where do
      {
        'sum_everything' => {
          counts: { 5 => 1, 10 => 2, 15 => 3 },
          bins: [nil, nil],
          expected_result: [6]
        },
        'open_ended_bins' => {
          counts: { 5 => 1, 6 => 2, 15 => 5 },
          bins: [nil, 6, nil],
          expected_result: [1, 7]
        },
        'closed_ended_bins' => {
          counts: (1..100).to_a.index_with(1),
          bins: [0, 10, 50, 110],
          expected_result: [9, 40, 51]
        },
        'counts_out_of_range' => {
          counts: (1..100).to_a.index_with(1),
          bins: [10, 50, 75], # the right-most bound (75) is not included
          expected_result: [40, 25]
        },
        'empty_bins' => {
          counts: { 1 => 1, 6 => 2 },
          bins: [2, 4, 6],
          expected_result: [0, 0]
        },
        'realistic_data' => {
          counts: { 16 => 1, 20 => 5, 25 => 9, 35 => 7, 47 => 3, 53 => 8, 66 => 6, 77 => 7 },
          bins: [nil, 21, 35, 55, nil],
          expected_result: [6, 9, 18, 13]
        },
        'default_min_is_zero' => {
          counts: { -1 => 1, 0 => 2 },
          bins: [nil, 100],
          expected_result: [2]
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
end
