# frozen_string_literal: true

require 'rails_helper'

describe Analysis::WebApi::V1::AnalysisSerializer do
  let(:result) { described_class.new(analysis, params: { current_user: create(:admin) }).serializable_hash }

  describe 'auto_insights_too_many_fields' do
    let(:main_field) { create(:custom_field_text) }

    context 'with 50 submission fields or fewer' do
      let(:analysis) { create(:ideation_analysis, main_custom_field: main_field, additional_custom_fields: build_list(:custom_field_text, 2)) }

      it 'is false' do
        expect(result.dig(:data, :attributes, :auto_insights_too_many_fields)).to be false
      end
    end

    context 'with more than 50 submission fields' do
      let(:additional_fields) do
        build_list(:custom_field_text, 10) + build_list(:custom_field_text, 10) + build_list(:custom_field_text, 10) +
          build_list(:custom_field_text, 10) + build_list(:custom_field_text, 10)
      end
      let(:analysis) { create(:ideation_analysis, main_custom_field: main_field, additional_custom_fields: additional_fields) }

      it 'is true' do
        expect(result.dig(:data, :attributes, :auto_insights_too_many_fields)).to be true
      end
    end

    context 'with many total fields but layout fields pushing the total over 50' do
      let(:additional_fields) do
        build_list(:custom_field_text, 10) + build_list(:custom_field_text, 10) + build_list(:custom_field_text, 10) +
          build_list(:custom_field_page, 10) + build_list(:custom_field_page, 10) + build_list(:custom_field_page, 5)
      end
      let(:analysis) { create(:ideation_analysis, main_custom_field: main_field, additional_custom_fields: additional_fields) }

      it 'is false (layout fields do not count)' do
        expect(result.dig(:data, :attributes, :auto_insights_too_many_fields)).to be false
      end
    end
  end

  describe 'all_custom_fields' do
    context 'with custom form' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:phase) { project.phases.first }
      let(:custom_form) { create(:custom_form, participation_context: phase) }
      let!(:main_field) { create(:custom_field_text, resource: custom_form) }
      let!(:available_fields) { create_list(:custom_field_checkbox, 2, resource: custom_form) }
      let!(:unavailable_fields) { create_list(:custom_field_checkbox, 2) }
      let(:analysis) { create(:analysis, phase: phase, project: nil, main_custom_field: main_field) }

      it 'includes all fields of the custom form' do
        expect(result.dig(:data, :relationships, :all_custom_fields, :data).pluck(:id)).to contain_exactly(main_field.id, *available_fields.map(&:id))
      end
    end

    context 'without custom form' do
      let(:analysis) { create(:ideation_analysis) }

      it 'includes all default fields' do
        actual_ids = result.dig(:data, :relationships, :all_custom_fields, :data).pluck(:id)
        expected_ids = IdeaCustomFieldsService.new(analysis.reload.participation_context.custom_form).all_fields.filter(&:supports_submission?).map(&:id)
        expect(actual_ids).to match_array expected_ids
      end
    end
  end
end
