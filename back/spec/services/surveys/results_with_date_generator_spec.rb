# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

# This spec describes:
#   * Unsupported fields are not considered. Unsupported means that we do
#     not have a visit_xxx method on the described class.
#   * Results are generated only for reportable fields (i.e. enabled).
#   * The order of the results is the same as the field order in the form.
#   * Results for one field are ordered in descending order.
#   * Result generation is supported for phases only.

RSpec.describe Surveys::ResultsWithDateGenerator do
  subject(:generator) { described_class.new survey_phase }

  include_context 'survey_setup'

  describe 'generate_results' do
    context 'when the responses are filtered by quarter' do
      let(:generated_results) do
        generator.generate_results(
          year: year,
          quarter: quarter
        )
      end

      context 'example 1' do
        let(:year) { '2025' }
        let(:quarter) { '2' }

        it 'returns the correct totals' do
          expect(generated_results[:results].count).to eq 18
          expect(generated_results[:totalSubmissions]).to eq 4
        end

        it 'returns linear scale averages for both this period and the previous period of the same length' do
          # Linear scale field
          expect(generated_results.dig(:results, 4, :averages)).to eq(
            { this_period: 3.5, last_period: 3.6 }
          )
          # Rating field
          expect(generated_results.dig(:results, 16, :averages)).to eq(
            { this_period: 3.5, last_period: 3.6 }
          )
          # Sentiment linear scale field
          expect(generated_results.dig(:results, 17, :averages)).to eq(
            { this_period: 3.3, last_period: 2.1 }
          )
        end
      end

      context 'example 2' do
        let(:year) { '2025' }
        let(:quarter) { '1' }

        it 'returns the correct totals' do
          expect(generated_results[:results].count).to eq 18
          expect(generated_results[:totalSubmissions]).to eq 23
        end

        it 'returns nil for "last_period" in averages when there are no results in the previous period' do
          # Linear scale field
          expect(generated_results.dig(:results, 4, :averages)).to eq(
            { this_period: 3.6, last_period: nil }
          )
          # Rating field
          expect(generated_results.dig(:results, 16, :averages)).to eq(
            { this_period: 3.6, last_period: nil }
          )
          # Sentiment linear scale field
          expect(generated_results.dig(:results, 17, :averages)).to eq(
            { this_period: 2.1, last_period: nil }
          )
        end
      end

      context 'incorrect date format' do
        let(:year) { 'YEAR' }
        let(:quarter) { '4' }

        it 'raises an incorrect month format error' do
          expect do
            generator.generate_results(
              year: year,
              quarter: quarter
            )
          end.to raise_error(ArgumentError, 'Invalid date format')
        end
      end
    end
  end
end
