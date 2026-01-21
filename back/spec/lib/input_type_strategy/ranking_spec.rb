# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputTypeStrategy::Ranking do
  subject(:input_type_strategy) { described_class.new(custom_field) }

  let(:custom_field) { build(:custom_field_ranking) }

  its(:page?) { is_expected.to be false }
  its(:supports_submission?) { is_expected.to be true }
  its(:supports_average?) { is_expected.to be false }
  its(:supports_options?) { is_expected.to be true }
  its(:supports_other_option?) { is_expected.to be false }
  its(:supports_option_images?) { is_expected.to be false }
  its(:supports_follow_up?) { is_expected.to be false }
  its(:supports_text?) { is_expected.to be false }
  its(:supports_linear_scale?) { is_expected.to be false }
  its(:supports_linear_scale_labels?) { is_expected.to be false }
  its(:supports_matrix_statements?) { is_expected.to be false }
  its(:supports_single_selection?) { is_expected.to be false }
  its(:supports_multiple_selection?) { is_expected.to be false }
  its(:supports_selection?) { is_expected.to be false }
  its(:supports_select_count?) { is_expected.to be false }
  its(:supports_dropdown_layout?) { is_expected.to be false }
  its(:supports_xlsx_export?) { is_expected.to be true }
  its(:supports_geojson?) { is_expected.to be true }
  its(:supports_printing?) { is_expected.to be true }
  its(:supports_pdf_gpt_import?) { is_expected.to be true }
  its(:supports_pdf_import?) { is_expected.to be false }
  its(:supports_xlsx_import?) { is_expected.to be true }
  its(:supports_reference_distribution?) { is_expected.to be false }
  its(:supports_file_upload?) { is_expected.to be false }
  its(:supports_logic?) { is_expected.to be true }
end
