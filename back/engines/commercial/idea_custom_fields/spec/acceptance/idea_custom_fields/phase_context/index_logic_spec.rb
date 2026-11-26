# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Survey logic in the custom fields of a phase.'
  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/phases/:phase_id/custom_fields' do
    parameter :copy, 'Return non-persisted copies of all custom fields with new IDs', type: :boolean, required: false
    parameter :public_fields, 'Only return custom fields that are visible to the public', type: :boolean, required: false

    let(:phase) { create(:native_survey_phase, with_permissions: true) }
    let(:phase_id) { phase.id }
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:page1) { create(:custom_field_page, resource: custom_form, key: 'page1') }
    let!(:select_field) do
      create(:custom_field_select, resource: custom_form, key: 'select_field').tap do |field|
        create(:custom_field_option, custom_field: field, key: 'cat')
        create(:custom_field_option, custom_field: field, key: 'dog')
      end
    end
    let!(:scale_field) { create(:custom_field_linear_scale, resource: custom_form, key: 'scale_field', maximum: 5) }
    let!(:page2) { create(:custom_field_page, resource: custom_form, key: 'page2') }
    let!(:disabled_field) { create(:custom_field_select, :with_options, resource: custom_form, key: 'disabled_field', enabled: false) }
    let!(:page3) { create(:custom_field_page, resource: custom_form, key: 'page3') }
    let!(:form_end) { create(:custom_field_form_end_page, resource: custom_form) }

    let(:cat) { select_field.options.find_by(key: 'cat') }
    let(:dog) { select_field.options.find_by(key: 'dog') }

    before do
      select_field.update!(logic: { rules: [
        { if: cat.id, goto_page_id: page3.id },
        { if: 'any_other_answer', goto_page_id: form_end.id },
        { if: 'no_answer', goto_page_id: page2.id }
      ] })
      scale_field.update!(logic: { rules: [{ if: 2, goto_page_id: form_end.id }, { if: 'no_answer', goto_page_id: page3.id }] })
      page2.update!(logic: { next_page_id: form_end.id })
      disabled_field.update!(logic: { rules: [{ if: disabled_field.options.first.id, goto_page_id: form_end.id }] })
    end

    def data_for(field)
      response_data.find { |data| data[:id] == field.id }
    end

    context 'when a resident fills in the survey' do
      before { header_token_for create(:user) }

      example 'Returns the logic of the enabled fields unchanged', document: false do
        do_request(public_fields: true)

        assert_status 200
        expect(response_data.pluck(:id)).not_to include(disabled_field.id)
        expect(data_for(select_field).dig(:attributes, :logic)).to eq({ rules: [
          { if: cat.id, goto_page_id: page3.id },
          { if: 'any_other_answer', goto_page_id: form_end.id },
          { if: 'no_answer', goto_page_id: page2.id }
        ] })
        expect(data_for(page2).dig(:attributes, :logic)).to eq({ next_page_id: form_end.id })
      end

      context 'when user fields are asked in the form' do
        let!(:user_field) { create(:custom_field_select, :for_registration, :with_options, key: 'user_select_field', enabled: true) }

        before do
          permission = phase.permissions.find_by(action: 'posting_idea')
          permission.update!(permitted_by: 'users', user_fields_in_form: true, custom_fields_behavior: 'custom', user_data_collection: 'all_data')
          create(:permissions_custom_field, custom_field: user_field, permission: permission)
        end

        example 'Redirects jumps to the end page to the user fields page, which gets a new id on every request', document: false do
          do_request(public_fields: true)

          assert_status 200
          keys = response_data.map { |data| data.dig(:attributes, :key) }
          expect(keys.last(3)).to eq %w[user_page u_user_select_field form_end]
          user_page_id = response_data[-3][:id]

          expect(data_for(select_field).dig(:attributes, :logic)).to eq({ rules: [
            { if: cat.id, goto_page_id: page3.id },
            { if: 'any_other_answer', goto_page_id: user_page_id },
            { if: 'no_answer', goto_page_id: page2.id }
          ] })
          expect(data_for(scale_field).dig(:attributes, :logic)).to eq({ rules: [
            { if: 2, goto_page_id: user_page_id },
            { if: 'no_answer', goto_page_id: page3.id }
          ] })
          expect(data_for(page2).dig(:attributes, :logic)).to eq({ next_page_id: user_page_id })
          expect(form_end.reload.id).not_to eq user_page_id
          expect(page2.reload.logic).to eq({ 'next_page_id' => form_end.id })

          do_request(public_fields: true)
          expect(response_data[-3][:id]).not_to eq user_page_id
        end
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example 'Returns the stored logic, including that of disabled fields, without the user fields page', document: false do
        do_request

        assert_status 200
        expect(response_data.map { |data| data.dig(:attributes, :key) }).not_to include('user_page')
        expect(data_for(disabled_field).dig(:attributes, :logic)).to eq({ rules: [{ if: disabled_field.options.first.id, goto_page_id: form_end.id }] })
      end

      example 'Remaps option and page ids of the copied logic but clears linear scale values (current behaviour)', document: false do
        do_request(copy: true)

        assert_status 200
        expect(response_data.pluck(:id) & custom_form.custom_fields.ids).to be_empty
        new_ids = custom_form.custom_fields.order(:ordering).map(&:id).zip(response_data.pluck(:id)).to_h
        copied_select = response_data[1]
        copied_cat_temp_id = json_response_body[:included]
          .select { |included| included[:type] == 'custom_field_option' }
          .find { |option| option.dig(:attributes, :key) == 'cat' && copied_select.dig(:relationships, :options, :data).pluck(:id).include?(option[:id]) }
          .dig(:attributes, :temp_id)

        expect(copied_cat_temp_id).to start_with('TEMP-ID-')
        expect(copied_select.dig(:attributes, :logic)).to eq({ rules: [
          { if: copied_cat_temp_id, goto_page_id: new_ids[page3.id] },
          { if: 'any_other_answer', goto_page_id: new_ids[form_end.id] },
          { if: 'no_answer', goto_page_id: new_ids[page2.id] }
        ] })
        expect(response_data[2].dig(:attributes, :logic)).to eq({ rules: [
          { if: nil, goto_page_id: new_ids[form_end.id] },
          { if: 'no_answer', goto_page_id: new_ids[page3.id] }
        ] })
        expect(response_data[3].dig(:attributes, :logic)).to eq({ next_page_id: new_ids[form_end.id] })
        expect(scale_field.reload.logic['rules'].first['if']).to eq 2
      end
    end
  end
end
