# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaCustomFields::UpdateAllService do
  describe 'stale form data' do
    let(:phase) { create(:native_survey_phase) }
    let!(:custom_form) { create(:custom_form, participation_context: phase, fields_last_updated_at: 1.hour.ago) }
    let!(:page) { create(:custom_field_page, resource: custom_form) }
    let!(:end_page) { create(:custom_field_form_end_page, resource: custom_form) }
    let(:user) { create(:admin) }

    let(:custom_fields_params) do
      [
        { id: page.id, input_type: 'page', page_layout: 'default', title_multiloc: { 'en' => 'Changed' } },
        { id: end_page.id, input_type: 'page', page_layout: 'default', key: 'form_end', title_multiloc: end_page.title_multiloc }
      ]
    end

    it 'rejects the save when another save committed after the form was loaded' do
      loaded_form = CustomForm.find(custom_form.id)
      opened_at = loaded_form.fields_last_updated_at
      CustomForm.find(custom_form.id).fields_updated!

      result = described_class.new(loaded_form, user, custom_fields: custom_fields_params, fields_last_updated_at: opened_at.iso8601).update_all

      expect(result.errors).to eq({ form: [{ error: 'stale_data' }] })
      expect(page.reload.title_multiloc).not_to eq({ 'en' => 'Changed' })
    end

    it 'saves when no other save committed after the form was loaded' do
      loaded_form = CustomForm.find(custom_form.id)

      result = described_class.new(loaded_form, user, custom_fields: custom_fields_params, fields_last_updated_at: loaded_form.fields_last_updated_at.iso8601).update_all

      expect(result).to be_success
      expect(page.reload.title_multiloc).to eq({ 'en' => 'Changed' })
    end

    it 'locks the form row, so concurrent saves of the form run one after the other' do
      opened_at = custom_form.fields_last_updated_at.iso8601
      expect(custom_form).to receive(:lock!).and_call_original

      result = described_class.new(custom_form, user, custom_fields: custom_fields_params, fields_last_updated_at: opened_at).update_all

      expect(result).to be_success
    end
  end

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
