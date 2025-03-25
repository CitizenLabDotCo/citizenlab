# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

RSpec.describe Surveys::AverageGenerator do
  subject(:generator) { described_class.new survey_phase }

  include_context 'survey_setup'

  describe 'field_averages_by_quarter' do
    it 'returns field results grouped by quarter' do
      averages = generator.field_averages_by_quarter
      expect(averages).to eq({
        number_field.id => { '2025-1' => 0, '2025-2' => 42.0 },
        linear_scale_field.id => { '2025-1' => 3.6, '2025-2' => 3.5 },
        rating_field.id => { '2025-1' => 3.6, '2025-2' => 3.5 },
        sentiment_linear_scale_field.id => { '2025-1' => 2.1, '2025-2' => 3.3 }
      })
    end
  end

  describe 'summary_averages_by_quarter' do
    # TODO: Test in community monitor context where categories are present
    context 'native survey' do
      it 'returns an object with overall averages and totals but nothing for categories' do
        averages = generator.summary_averages_by_quarter
        expect(averages).to eq({
          overall: {
            averages: { '2025-1' => 2.3, '2025-2' => 13.1 },
            totals: {
              '2025-1' => { 1 => 12, 2 => 16, 3 => 21, 5 => 3, 6 => 4, 7 => 6 },
              '2025-2' => { 3 => 3, 42 => 1, 4 => 2, 2 => 1, 5 => 1 }
            }
          }
        })
      end
    end

    it 'does not run too many queries' do
      expect { generator.summary_averages_by_quarter }.not_to exceed_query_limit(8)
    end
  end

  describe 'overall_average_by_quarter' do
    it 'returns an overall average per quarter' do
      averages = generator.send(:overall_average_by_quarter)
      expect(averages).to eq({ '2025-1' => 2.3, '2025-2' => 13.1 })
    end
  end

  describe 'category_averages_by_quarter' do
    it 'returns an averages by category per quarter' do
      # TODO: This is not yet tested currently in the context of a survey with categories (community monitor)
      averages = generator.send(:category_averages_by_quarter)
      expect(averages).to eq({ nil => { '2025-1' => 2.3, '2025-2' => 13.1 } })
    end
  end

  describe 'totals_by_quarter' do
    it 'returns totals for each question grouped by quarter' do
      totals = generator.send(:totals_by_quarter)
      expect(totals).to eq({
        '2025-1' => { 1 => 12, 2 => 16, 3 => 21, 5 => 3, 6 => 4, 7 => 6 },
        '2025-2' => { 3 => 3, 42 => 1, 4 => 2, 2 => 1, 5 => 1 }
      })
    end
  end
end
