# frozen_string_literal: true

require 'rails_helper'
require './spec/services/surveys/shared/survey_setup'

RSpec.describe Surveys::AverageGenerator do
  subject(:generator) { described_class.new survey_phase }

  context 'native survey' do
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
      it 'returns an object with overall averages and totals but nothing for categories' do
        averages = generator.summary_averages_by_quarter
        expect(averages).to eq({
          overall: {
            averages: { '2025-1' => 3.0, '2025-2' => 8.3 },
            totals: {
              '2025-1' => { 1 => 12, 2 => 16, 3 => 21, 4 => 0, 5 => 3, 6 => 4, 7 => 6 },
              '2025-2' => { 1 => 0, 2 => 1, 3 => 3, 4 => 2, 5 => 1, 6 => 0, 7 => 0, 42 => 1 }
            }
          },
          categories: {
            averages: {},
            multilocs: {}
          }
        })
      end

      it 'returns empty objects when there are no answers' do
        Idea.destroy_all
        averages = generator.summary_averages_by_quarter
        expect(averages).to eq({
          overall: {
            averages: {},
            totals: {}
          },
          categories: {
            averages: {},
            multilocs: {}
          }
        })
      end

      it 'does not run too many queries' do
        expect { generator.summary_averages_by_quarter }.not_to exceed_query_limit(8)
      end
    end

    describe 'overall_average_by_quarter' do
      it 'returns an overall average per quarter' do
        averages = generator.send(:overall_average_by_quarter)
        expect(averages).to eq({ '2025-1' => 3.0, '2025-2' => 8.3 })
      end
    end

    describe 'category_averages_by_quarter' do
      it 'returns an averages by category per quarter' do
        averages = generator.send(:category_averages_by_quarter)
        expect(averages).to eq({})
      end
    end
  end

  context 'community monitor survey' do
    let_it_be(:survey_phase) { create(:community_monitor_survey_phase) }

    before do
      survey_phase.pmethod.create_default_form!
      # Additional question with no category
      create(:custom_field_sentiment_linear_scale, key: 'another_question', resource: survey_phase.custom_form)
      create(:idea_status_proposed)
      create(:native_survey_response,
        project: survey_phase.project,
        creation_phase: survey_phase,
        phases: [survey_phase],
        custom_field_values: { 'place_to_live' => 3, 'overall_value' => 3, 'trust_in_government' => 3 },
        created_at: '2025-01-20')
      create(:native_survey_response,
        project: survey_phase.project,
        creation_phase: survey_phase,
        phases: [survey_phase],
        custom_field_values: { 'sense_of_safety' => 2, 'quality_of_services' => 2, 'responsiveness_of_officials' => 1 },
        created_at: '2025-01-20')
      create(:native_survey_response,
        project: survey_phase.project,
        creation_phase: survey_phase,
        phases: [survey_phase],
        custom_field_values: { 'affordable_housing' => 4, 'cleanliness_and_maintenance' => 3, 'transparency_of_money_spent' => 1, 'another_question' => 2 },
        created_at: '2025-04-20')
      create(:native_survey_response,
        project: survey_phase.project,
        creation_phase: survey_phase,
        phases: [survey_phase],
        custom_field_values: { 'sense_of_safety' => 1, 'quality_of_services' => 5, 'responsiveness_of_officials' => 2, 'another_question' => 1 },
        created_at: '2025-04-20')
    end

    describe 'summary_averages_by_quarter' do
      it 'returns an object with overall averages and totals but nothing for categories' do
        averages = generator.summary_averages_by_quarter
        expect(averages).to eq({
          overall: {
            averages: { '2025-1' => 2.3, '2025-2' => 2.4 },
            totals: {
              '2025-1' => { 1 => 1, 2 => 2, 3 => 3, 4 => 0, 5 => 0 },
              '2025-2' => { 1 => 3, 2 => 2, 3 => 1, 4 => 1, 5 => 1 }
            }
          },
          categories: {
            averages: {
              'quality_of_life' => { '2025-1' => 2.5, '2025-2' => 2.5 },
              'service_delivery' => { '2025-1' => 2.5, '2025-2' => 4.0 },
              'governance_and_trust' => { '2025-1' => 2.0, '2025-2' => 1.5 },
              'other' => { '2025-1' => 0.0, '2025-2' => 1.5 }
            },
            multilocs: {
              'quality_of_life' => { 'en' => 'Quality of life', 'fr-FR' => 'Qualité de vie', 'nl-NL' => 'Kwaliteit van leven' },
              'service_delivery' => { 'en' => 'Service delivery', 'fr-FR' => 'Prestation de services', 'nl-NL' => 'Dienstverlening' },
              'governance_and_trust' => { 'en' => 'Governance and trust', 'fr-FR' => 'Gouvernance et confiance', 'nl-NL' => 'Bestuur en vertrouwen' },
              'other' => { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' }
            }
          }
        })
      end

      it 'returns empty objects when there are no answers' do
        Idea.destroy_all
        averages = generator.summary_averages_by_quarter
        expect(averages).to eq({
          overall: {
            averages: {},
            totals: {}
          },
          categories: {
            averages: {
              'quality_of_life' => {},
              'service_delivery' => {},
              'governance_and_trust' => {},
              'other' => {}
            },
            multilocs: {
              'quality_of_life' => { 'en' => 'Quality of life', 'fr-FR' => 'Qualité de vie', 'nl-NL' => 'Kwaliteit van leven' },
              'service_delivery' => { 'en' => 'Service delivery', 'fr-FR' => 'Prestation de services', 'nl-NL' => 'Dienstverlening' },
              'governance_and_trust' => { 'en' => 'Governance and trust', 'fr-FR' => 'Gouvernance et confiance', 'nl-NL' => 'Bestuur en vertrouwen' },
              'other' => { 'en' => 'Other', 'fr-FR' => 'Autre', 'nl-NL' => 'Ander' }
            }
          }
        })
      end

      it 'does not run too many queries' do
        expect { generator.summary_averages_by_quarter }.not_to exceed_query_limit(8)
      end
    end

    describe 'category_averages_by_quarter' do
      it 'returns an averages by category per quarter' do
        averages = generator.send(:category_averages_by_quarter)
        expect(averages).to eq({
          'quality_of_life' => { '2025-1' => 2.5, '2025-2' => 2.5 },
          'service_delivery' => { '2025-1' => 2.5, '2025-2' => 4.0 },
          'governance_and_trust' => { '2025-1' => 2.0, '2025-2' => 1.5 },
          'other' => { '2025-1' => 0.0, '2025-2' => 1.5 }
        })
      end
    end

    describe 'totals_by_quarter' do
      it 'returns totals for each question grouped by quarter (including zeroes)' do
        totals = generator.send(:totals_by_quarter)
        expect(totals).to eq({
          '2025-1' => { 1 => 1, 2 => 2, 3 => 3, 4 => 0, 5 => 0 },
          '2025-2' => { 1 => 3, 2 => 2, 3 => 1, 4 => 1, 5 => 1 }
        })
      end
    end
  end
end
