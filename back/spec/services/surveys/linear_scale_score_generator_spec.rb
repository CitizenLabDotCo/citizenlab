# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

RSpec.describe Surveys::LinearScaleScoreGenerator do
  subject(:generator) { described_class.new survey_phase }

  include_context 'survey_setup'

  # TODO: Test that not too many queries are made here - also do this in the survey results generator

  describe 'field_scores_by_quarter' do
    it 'returns field results grouped by quarter' do
      scores = generator.field_scores_by_quarter
      expect(scores).to eq({
        linear_scale_field.id => { '2025-2' => 3.5, '2025-1' => 3.6 },
        rating_field.id => { '2025-2' => 3.5, '2025-1' => 3.6 },
        sentiment_linear_scale_field.id => { '2025-2' => 3.3, '2025-1' => 2.1 }
      })
    end
  end

  describe 'overall_score_by_quarter' do
    it 'returns an overall score per quarter' do
      scores = generator.overall_score_by_quarter
      expect(scores).to eq({ '2025-2' => 3.4, '2025-1' => 3.1 })
    end
  end
end
