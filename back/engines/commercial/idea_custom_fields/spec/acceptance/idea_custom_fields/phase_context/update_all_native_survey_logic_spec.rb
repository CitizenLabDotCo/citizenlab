# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Survey logic saved through the form builder.'
  before { header 'Content-Type', 'application/json' }

  patch 'web_api/v1/phases/:phase_id/custom_fields/update_all' do
    parameter :custom_fields, type: :array
    with_options scope: 'custom_fields[]' do
      parameter :id, 'The ID of an existing custom field to update.', required: false
      parameter :logic, 'The logic JSON for the field'
    end

    let(:phase) { create(:native_survey_phase) }
    let(:phase_id) { phase.id }
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:page1) { create(:custom_field_page, resource: custom_form, key: 'page1') }
    let!(:select_field) do
      create(:custom_field_select, resource: custom_form, key: 'select_field', required: false).tap do |field|
        create(:custom_field_option, custom_field: field, key: 'cat')
        create(:custom_field_option, custom_field: field, key: 'dog')
      end
    end
    let!(:page2) { create(:custom_field_page, resource: custom_form, key: 'page2') }
    let!(:scale_field) { create(:custom_field_linear_scale, resource: custom_form, key: 'scale_field', maximum: 5) }
    let!(:page3) { create(:custom_field_page, resource: custom_form, key: 'page3') }
    let!(:form_end) { create(:custom_field_form_end_page, resource: custom_form) }

    let(:cat) { select_field.options.find_by(key: 'cat') }
    let(:dog) { select_field.options.find_by(key: 'dog') }

    before { admin_header_token }

    def field_params(field, **attributes)
      params = {
        id: field.id,
        input_type: field.input_type,
        title_multiloc: field.title_multiloc,
        required: field.required,
        enabled: field.enabled
      }
      params[:key] = field.key if field.form_end_page?
      params[:page_layout] = 'default' if field.page?
      params[:maximum] = field.maximum if field.maximum
      params.merge(attributes)
    end

    def form_params(overrides = {})
      fields = [page1, select_field, page2, scale_field, page3, form_end]
      { custom_fields: fields.map { |field| field_params(field, **overrides.fetch(field, {})) } }
    end

    def response_logic(field)
      response_data.find { |data| data[:id] == field.id }.dig(:attributes, :logic)
    end

    def logic_errors
      json_response_body[:errors].transform_values { |errors| errors[:logic] }.compact
    end

    example 'Stores option, any_other_answer and no_answer rules of an optional select' do
      rules = [
        { if: cat.id, goto_page_id: page3.id },
        { if: 'any_other_answer', goto_page_id: form_end.id },
        { if: 'no_answer', goto_page_id: page2.id }
      ]
      do_request form_params(select_field => { logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: })
      expect(select_field.reload.logic['rules'].pluck('if')).to eq [cat.id, 'any_other_answer', 'no_answer']
    end

    example 'Drops the no_answer rule of a required select without an error (current behaviour, N5)', document: false do
      rules = [{ if: cat.id, goto_page_id: page3.id }, { if: 'no_answer', goto_page_id: page2.id }]
      do_request form_params(select_field => { required: true, logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: [{ if: cat.id, goto_page_id: page3.id }] })
    end

    example 'Drops a rule whose option does not exist without an error (current behaviour, B5)', document: false do
      rules = [{ if: 'unknown-option-id', goto_page_id: page3.id }, { if: dog.id, goto_page_id: page3.id }]
      do_request form_params(select_field => { logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: [{ if: dog.id, goto_page_id: page3.id }] })
    end

    example 'Keeps the second of two consecutive rules with unknown options (current behaviour, B5)', document: false do
      rules = [
        { if: 'unknown-option-1', goto_page_id: page3.id },
        { if: 'unknown-option-2', goto_page_id: page3.id },
        { if: dog.id, goto_page_id: page3.id }
      ]
      do_request form_params(select_field => { logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)[:rules].pluck(:if)).to eq ['unknown-option-2', dog.id]
    end

    example 'Drops the rule of an option deleted in the same request', document: false do
      options = [{ id: dog.id, title_multiloc: dog.title_multiloc }]
      rules = [{ if: cat.id, goto_page_id: page3.id }, { if: dog.id, goto_page_id: form_end.id }]
      do_request form_params(select_field => { options:, logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: [{ if: dog.id, goto_page_id: form_end.id }] })
    end

    example 'Replaces the temp id of a new option in a rule by the option id', document: false do
      options = [
        { id: cat.id, title_multiloc: cat.title_multiloc },
        { id: dog.id, title_multiloc: dog.title_multiloc },
        { temp_id: 'TEMP-ID-OPTION', title_multiloc: { en: 'Bird' } }
      ]
      do_request form_params(select_field => { options:, logic: { rules: [{ if: 'TEMP-ID-OPTION', goto_page_id: page3.id }] } })

      assert_status 200
      bird = select_field.reload.options.find_by(title_multiloc: { en: 'Bird' })
      expect(response_logic(select_field)).to eq({ rules: [{ if: bird.id, goto_page_id: page3.id }] })
    end

    example 'Stores linear scale rules with integer and string values as sent (current behaviour, B14)', document: false do
      rules = [{ if: 1, goto_page_id: form_end.id }, { if: '2', goto_page_id: form_end.id }, { if: 9, goto_page_id: form_end.id }]
      do_request form_params(scale_field => { logic: { rules: } })

      assert_status 200
      expect(scale_field.reload.logic['rules'].pluck('if')).to eq [1, '2', 9]
    end

    example 'Keeps the no_answer rule of a linear scale that is made required (current behaviour, N5)', document: false do
      scale_field.update!(logic: { rules: [{ if: 'no_answer', goto_page_id: page3.id }] })
      do_request form_params(scale_field => { required: true, logic: { rules: [{ if: 'no_answer', goto_page_id: page3.id }] } })

      assert_status 200
      expect(scale_field.reload.required).to be true
      expect(scale_field.logic).to eq({ 'rules' => [{ 'if' => 'no_answer', 'goto_page_id' => page3.id }] })
    end

    example 'Keeps a linear scale rule above a lowered maximum (current behaviour, N5)', document: false do
      scale_field.update!(logic: { rules: [{ if: 5, goto_page_id: form_end.id }] })
      do_request form_params(scale_field => { maximum: 3, logic: { rules: [{ if: 5, goto_page_id: form_end.id }] } })

      assert_status 200
      expect(scale_field.reload.maximum).to eq 3
      expect(scale_field.logic['rules'].pluck('if')).to eq [5]
    end

    example 'Stores any_other_answer and no_answer rules of a linear scale', document: false do
      rules = [{ if: 'any_other_answer', goto_page_id: form_end.id }, { if: 'no_answer', goto_page_id: page3.id }]
      do_request form_params(scale_field => { logic: { rules: } })

      assert_status 200
      expect(response_logic(scale_field)).to eq({ rules: })
    end

    example 'Stores rules of several questions on the same page', document: false do
      other_select = create(:custom_field_select, :with_options, resource: custom_form)
      fields = [page1, select_field, other_select, page2, scale_field, page3, form_end]
      request = {
        custom_fields: fields.map { |field| field_params(field) }.tap do |params|
          params[1][:logic] = { rules: [{ if: cat.id, goto_page_id: page3.id }] }
          params[2][:logic] = { rules: [{ if: other_select.options.first.id, goto_page_id: form_end.id }] }
          params[0][:logic] = { next_page_id: page2.id }
        end
      }
      do_request request

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: [{ if: cat.id, goto_page_id: page3.id }] })
      expect(response_logic(other_select)).to eq({ rules: [{ if: other_select.options.first.id, goto_page_id: form_end.id }] })
      expect(response_logic(page1)).to eq({ next_page_id: page2.id })
    end

    example 'Allows a jump to a disabled page (current behaviour, N4)', document: false do
      do_request form_params(page3 => { enabled: false }, select_field => { logic: { rules: [{ if: cat.id, goto_page_id: page3.id }] } })

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: [{ if: cat.id, goto_page_id: page3.id }] })
    end

    example 'Allows page logic that jumps to the end page', document: false do
      do_request form_params(page1 => { logic: { next_page_id: form_end.id } })

      assert_status 200
      expect(response_logic(page1)).to eq({ next_page_id: form_end.id })
    end

    example '[error] Rejects the literal form_end as a target', document: false do
      do_request form_params(page1 => { logic: { next_page_id: 'form_end' } })

      assert_status 422
      expect(logic_errors).to eq({ '0': [{ error: 'invalid_next_page_id', value: 'form_end' }] })
    end

    example '[error] Rejects a rule that jumps backwards', document: false do
      do_request form_params(scale_field => { logic: { rules: [{ if: 1, goto_page_id: page1.id }] } })

      assert_status 422
      expect(logic_errors).to eq({ '3': [{ error: 'target_before_source_not_allowed', value: page1.id }] })
    end

    example '[error] Rejects page logic that targets the page itself', document: false do
      do_request form_params(page2 => { logic: { next_page_id: page2.id } })

      assert_status 422
      expect(logic_errors).to eq({ '2': [{ error: 'target_before_source_not_allowed', value: page2.id }] })
    end

    example '[error] Rejects a rule that targets a question', document: false do
      do_request form_params(select_field => { logic: { rules: [{ if: cat.id, goto_page_id: scale_field.id }] } })

      assert_status 422
      expect(logic_errors).to eq({ '1': [{ error: 'only_page_allowed_as_target', value: scale_field.id }] })
    end

    example '[error] Rejects page logic with rules', document: false do
      do_request form_params(page1 => { logic: { rules: [{ if: 1, goto_page_id: page3.id }] } })

      assert_status 422
      expect(logic_errors).to eq({ '0': [{ error: 'invalid_structure' }] })
    end

    example '[error] Persists the other changes and the invalid logic when logic is invalid (current behaviour, B4)', document: false do
      do_request form_params(
        select_field => { title_multiloc: { en: 'Changed title' }, logic: { rules: [{ if: cat.id, goto_page_id: page3.id }] } },
        scale_field => { logic: { rules: [{ if: 1, goto_page_id: page1.id }] } }
      )

      assert_status 422
      expect(select_field.reload.title_multiloc).to eq({ 'en' => 'Changed title' })
      expect(select_field.logic).to eq({ 'rules' => [{ 'if' => cat.id, 'goto_page_id' => page3.id }] })
      expect(scale_field.reload.logic).to eq({ 'rules' => [{ 'if' => 1, 'goto_page_id' => page1.id }] })
    end

    example '[error] Persists an unresolved temp id when the target page does not exist (current behaviour, B4)', document: false do
      do_request form_params(page1 => { logic: { next_page_id: 'TEMP-ID-MISSING' } })

      assert_status 422
      expect(logic_errors).to eq({ '0': [{ error: 'invalid_next_page_id', value: 'TEMP-ID-MISSING' }] })
      expect(page1.reload.logic).to eq({ 'next_page_id' => 'TEMP-ID-MISSING' })
    end

    example 'Drops the rules of a rating question without an error (current behaviour, B1)', document: false do
      rating_field = create(:custom_field_rating, resource: custom_form, maximum: 5)
      request = form_params
      request[:custom_fields].insert(4, field_params(rating_field, logic: { rules: [{ if: 1, goto_page_id: form_end.id }] }))
      do_request request

      assert_status 200
      expect(response_logic(rating_field)).to eq({})
      expect(rating_field.reload.logic).to eq({})
    end

    example 'Drops the rules of a sentiment scale question without an error (current behaviour)', document: false do
      sentiment_field = create(:custom_field_sentiment_linear_scale, resource: custom_form)
      request = form_params
      request[:custom_fields].insert(4, field_params(sentiment_field, logic: { rules: [{ if: 1, goto_page_id: form_end.id }] }))
      do_request request

      assert_status 200
      expect(response_logic(sentiment_field)).to eq({})
    end

    example 'Drops the rules of a new multiselect question without an error', document: false do
      request = form_params
      request[:custom_fields].insert(2, {
        input_type: 'multiselect',
        title_multiloc: { en: 'New multiselect' },
        options: [{ temp_id: 'TEMP-ID-A', title_multiloc: { en: 'A' } }],
        logic: { rules: [{ if: 'TEMP-ID-A', goto_page_id: page3.id }] }
      })
      do_request request

      assert_status 200
      expect(response_data[2].dig(:attributes, :input_type)).to eq 'multiselect'
      expect(response_data[2].dig(:attributes, :logic)).to eq({})
    end

    example 'Wipes legacy multiselect rules on the first save, even when the request does not send logic (current behaviour, B7)', document: false do
      multiselect_field = create(:custom_field_multiselect, :with_options, resource: custom_form)
      multiselect_field.update_column(:logic, { 'rules' => [{ 'if' => multiselect_field.options.first.id, 'goto_page_id' => page3.id }] })
      request = form_params
      request[:custom_fields].insert(2, field_params(multiselect_field))
      do_request request

      assert_status 200
      expect(multiselect_field.reload.logic).to eq({})
    end

    example 'Keeps the rules of a ranking question (current behaviour, B8)', document: false do
      ranking_field = create(:custom_field_ranking, :with_options, resource: custom_form)
      rules = [{ if: ranking_field.options.first.id, goto_page_id: form_end.id }]
      request = form_params
      request[:custom_fields].insert(4, field_params(ranking_field, logic: { rules: }))
      do_request request

      assert_status 200
      expect(response_logic(ranking_field)).to eq({ rules: })
    end

    example 'Drops the rules of a text question without an error', document: false do
      text_field = create(:custom_field_text, resource: custom_form)
      request = form_params
      request[:custom_fields].insert(4, field_params(text_field, logic: { rules: [{ if: 'yes', goto_page_id: form_end.id }] }))
      do_request request

      assert_status 200
      expect(response_logic(text_field)).to eq({})
    end
  end
end
