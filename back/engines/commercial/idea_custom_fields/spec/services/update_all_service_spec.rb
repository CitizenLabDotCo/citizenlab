# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaCustomFields::UpdateAllService do
  describe 'performance' do
    let(:phase) { create(:native_survey_phase) }
    let!(:custom_form) { create(:custom_form, participation_context: phase) }
    let(:user) { create(:admin) }

    def field_to_params(field)
      params = {
        id: field.id,
        input_type: field.input_type,
        title_multiloc: field.title_multiloc,
        enabled: field.enabled,
        required: field.required
      }
      params[:page_layout] = 'default' if field.input_type == 'page'
      params[:key] = 'form_end' if field.key == 'form_end'
      if field.options.any?
        params[:options] = field.options.map do |opt|
          { id: opt.id, title_multiloc: opt.title_multiloc }
        end
      end
      params
    end

    it 'does not generate more ordering UPDATEs than expected when reordering fields' do
      page = create(:custom_field_page, resource: custom_form)
      text_fields = create_list(:custom_field, 4, resource: custom_form)
      select_fields = create_list(:custom_field_select, 3, :with_options, resource: custom_form)
      linear_scale = create(:custom_field_linear_scale, resource: custom_form)
      end_page = create(:custom_field_page, resource: custom_form, key: 'form_end')

      reordered_fields = [page] + select_fields + text_fields + [linear_scale, end_page]
      custom_fields_params = reordered_fields.map { |field| field_to_params(field) }

      # Expected: 1 UPDATE for fields + 3 UPDATEs for options (one per select field) = 4.
      expect do
        described_class.new(custom_form, user, custom_fields: custom_fields_params).update_all
      end.not_to exceed_query_limit(4).with(/UPDATE.*ordering/)
    end
  end
end
