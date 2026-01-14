# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InputStrategy::FileUpload do
  subject(:input_strategy) { described_class.new(custom_field) }

  let(:custom_field) { build(:custom_field, input_type: 'file_upload') }

  its(:structural_field?) { is_expected.to be false }
  its(:supports_submission?) { is_expected.to be true }
  its(:supports_average?) { is_expected.to be false }
  its(:supports_options?) { is_expected.to be false }
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
  its(:supports_multiloc?) { is_expected.to be false }
end
