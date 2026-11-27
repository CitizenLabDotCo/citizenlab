# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputTypeStrategy::MultiselectImage do
  subject(:input_type_strategy) { described_class.new(custom_field) }

  let(:custom_field) { build(:custom_field_multiselect_image) }

  its(:page?) { is_expected.to be false }
  its(:supports_submission?) { is_expected.to be true }
  its(:supports_average?) { is_expected.to be false }
  its(:supports_options?) { is_expected.to be true }
  its(:supports_other_option?) { is_expected.to be true }
  its(:supports_option_images?) { is_expected.to be true }
  its(:supports_follow_up?) { is_expected.to be false }
  its(:supports_text?) { is_expected.to be false }
  its(:supports_linear_scale?) { is_expected.to be false }
  its(:supports_linear_scale_labels?) { is_expected.to be false }
  its(:supports_matrix_statements?) { is_expected.to be false }
  its(:supports_single_selection?) { is_expected.to be false }
  its(:supports_multiple_selection?) { is_expected.to be true }
  its(:supports_selection?) { is_expected.to be true }
  its(:supports_answer_facet?) { is_expected.to be false }
  its(:supports_select_count?) { is_expected.to be true }
  its(:supports_dropdown_layout?) { is_expected.to be false }
  its(:supports_xlsx_export?) { is_expected.to be true }
  its(:supports_geojson?) { is_expected.to be true }
  its(:supports_printing?) { is_expected.to be true }
  its(:supports_pdf_import?) { is_expected.to be true }
  its(:supports_xlsx_import?) { is_expected.to be true }
  its(:supports_reference_distribution?) { is_expected.to be false }
  its(:supports_file_upload?) { is_expected.to be false }
  its(:supports_logic?) { is_expected.to be false }

  describe '#supports_logic?' do
    let(:rules) { { 'rules' => [{ 'if' => 'option-id', 'goto_page_id' => 'page-id' }] } }

    def stored_field(created_at:, logic:)
      create(:custom_field_multiselect_image, :for_custom_form, created_at: created_at).tap do |field|
        field.update_column(:logic, logic)
        field.reload
      end
    end

    it 'is true for a question created before the cutoff that has rules' do
      field = stored_field(created_at: Time.utc(2026, 1, 17, 23, 59, 59), logic: rules)
      expect(described_class.new(field).supports_logic?).to be true
    end

    it 'is false for a question created on the cutoff that has rules' do
      field = stored_field(created_at: Time.utc(2026, 1, 18), logic: rules)
      expect(described_class.new(field).supports_logic?).to be false
    end

    it 'is false for a question created before the cutoff without rules' do
      field = stored_field(created_at: Time.utc(2025, 6, 1), logic: { 'rules' => [] })
      expect(described_class.new(field).supports_logic?).to be false
    end
  end
end
