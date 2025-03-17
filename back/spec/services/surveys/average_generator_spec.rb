# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

RSpec.describe Surveys::AverageGenerator do
  subject(:generator) { described_class.new survey_phase }

  include_context 'survey_setup'

  # TODO: Test that not too many queries are made here - also do this in the survey results generator

  describe 'field_averages_by_quarter' do
    it 'returns field results grouped by quarter' do
      averages = generator.field_averages_by_quarter
      expect(averages).to eq({
        number_field.id => { '2025-2' => 42.0, '2025-1' => 0 },
        linear_scale_field.id => { '2025-2' => 3.5, '2025-1' => 3.6 },
        rating_field.id => { '2025-2' => 3.5, '2025-1' => 3.6 },
        sentiment_linear_scale_field.id => { '2025-2' => 3.3, '2025-1' => 2.1 }
      })
    end
  end

  describe 'overall_average_by_quarter' do
    it 'returns an overall average per quarter' do
      averages = generator.overall_average_by_quarter
      expect(averages).to eq({ '2025-2' => 13.1, '2025-1' => 2.3 })
    end
  end

  describe 'category_averages_by_quarter' do
    it 'returns an overall average per quarter' do
      averages = generator.category_averages_by_quarter
      expect(averages).to eq({ '2025-2' => 13.1, '2025-1' => 2.3 })
    end
  end
end
