# frozen_string_literal: true

require 'rails_helper'
require 'insights/min_max_scaler'

RSpec.describe Insights::MinMaxScaler do
  describe '.transform' do
    using RSpec::Parameterized::TableSyntax

    where(:input_range, :output_range, :value, :expected) do
      # rubocop:disable Lint/BinaryOperatorWithIdenticalOperands
      [0, 1] | [0, 1] | 0.75 | 0.75
      [0, 1] | [0, 2] | 0    | 0
      [0, 1] | [0, 2] | 0.75 | 1.5
      [0, 4] | [0, 2] | 2    | 1
      [2, 6] | [1, 2] | 4    | 1.5
      # rubocop:enable Lint/BinaryOperatorWithIdenticalOperands
    end

    with_them do
      it 'rescales the value correctly' do
        scaler = described_class.new(input_range, output_range)
        scaled = scaler.transform(value)
        expect(scaled).to eq(expected)
      end

      it 'can inverse the transform' do
        scaler = described_class.new(output_range, input_range)
        inverse = scaler.transform(expected)
        expect(inverse).to eq(value)
      end
    end
  end
end
