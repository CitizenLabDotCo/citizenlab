# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

# NOTE: These tests only test the addition of filtering by year & quarter to results

RSpec.describe Surveys::ResultsWithDateGenerator do
  subject(:generator) { described_class.new survey_phase, year: year, quarter: quarter }

  include_context 'survey_setup'

  describe 'generate_results' do
    context 'when the responses are filtered by quarter' do
      let(:generated_results) { generator.generate_results }
      let(:single_result) { generator.generate_result_for_field(sentiment_linear_scale_field.id) }

      context 'example 1' do
        let(:year) { 2025 }
        let(:quarter) { 2 }

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

        it 'returns a single result for a Sentiment linear scale field' do
          expect(single_result[:averages]).to eq({ this_period: 3.3, last_period: 2.1 })
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

        it 'returns a single result with last_period: nil for a Sentiment linear scale field' do
          expect(single_result[:averages]).to eq({ this_period: 2.1, last_period: nil })
        end
      end

      context 'incorrect date format' do
        let(:year) { 'YEAR' }
        let(:quarter) { '4' }

        it 'raises an incorrect date format error' do
          expect { generated_results }.to raise_error(ArgumentError, 'Invalid date format')
        end

        it 'raises an incorrect date format error for a single result' do
          expect { single_result }.to raise_error(ArgumentError, 'Invalid date format')
        end
      end
    end
  end
end
