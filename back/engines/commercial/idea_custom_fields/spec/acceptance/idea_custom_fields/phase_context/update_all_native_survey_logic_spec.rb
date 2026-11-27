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

    example 'Drops the no_answer rule of a required select without an error (current behaviour)', document: false do
      rules = [{ if: cat.id, goto_page_id: page3.id }, { if: 'no_answer', goto_page_id: page2.id }]
      do_request form_params(select_field => { required: true, logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: [{ if: cat.id, goto_page_id: page3.id }] })
    end

    example 'Drops a rule whose option does not exist without an error (current behaviour)', document: false do
      rules = [{ if: 'unknown-option-id', goto_page_id: page3.id }, { if: dog.id, goto_page_id: page3.id }]
      do_request form_params(select_field => { logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)).to eq({ rules: [{ if: dog.id, goto_page_id: page3.id }] })
    end

    example 'Drops each of two consecutive rules with unknown options', document: false do
      rules = [
        { if: 'unknown-option-1', goto_page_id: page3.id },
        { if: 'unknown-option-2', goto_page_id: page3.id },
        { if: dog.id, goto_page_id: page3.id }
      ]
      do_request form_params(select_field => { logic: { rules: } })

      assert_status 200
      expect(response_logic(select_field)[:rules].pluck(:if)).to eq [dog.id]
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

    example 'Keeps linear scale rules on the lowest and highest value of the scale', document: false do
      rules = [{ if: 1, goto_page_id: page3.id }, { if: 5, goto_page_id: form_end.id }]
      do_request form_params(scale_field => { logic: { rules: } })

      assert_status 200
      expect(scale_field.reload.logic['rules'].pluck('if')).to eq [1, 5]
    end

    example 'Drops linear scale rules on a string or on a value outside the scale without an error', document: false do
      rules = [
        { if: 0, goto_page_id: form_end.id },
        { if: 1, goto_page_id: form_end.id },
        { if: '2', goto_page_id: form_end.id },
        { if: 6, goto_page_id: form_end.id },
        { if: 99, goto_page_id: form_end.id },
        { if: 'yes', goto_page_id: form_end.id }
      ]
      do_request form_params(scale_field => { logic: { rules: } })

      assert_status 200
      expect(scale_field.reload.logic['rules'].pluck('if')).to eq [1]
    end

    example 'Drops the no_answer rule of a linear scale that is made required', document: false do
      rules = [{ if: 'no_answer', goto_page_id: page3.id }, { if: 2, goto_page_id: form_end.id }, { if: 'any_other_answer', goto_page_id: page3.id }]
      scale_field.update!(logic: { rules: })
      do_request form_params(scale_field => { required: true, logic: { rules: } })

      assert_status 200
      expect(scale_field.reload.required).to be true
      expect(scale_field.logic['rules'].pluck('if')).to eq [2, 'any_other_answer']
    end

    example 'Drops the linear scale rules above a lowered maximum', document: false do
      rules = [{ if: 3, goto_page_id: page3.id }, { if: 4, goto_page_id: form_end.id }, { if: 5, goto_page_id: form_end.id }]
      scale_field.update!(logic: { rules: })
      do_request form_params(scale_field => { maximum: 3, logic: { rules: } })

      assert_status 200
      expect(scale_field.reload.maximum).to eq 3
      expect(scale_field.logic['rules'].pluck('if')).to eq [3]
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

    example 'Allows a jump to a disabled page (currently existing bug, N4)', document: false do
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

    example '[error] Persists none of the changes when logic is invalid', document: false do
      do_request form_params(
        select_field => { title_multiloc: { en: 'Changed title' }, logic: { rules: [{ if: cat.id, goto_page_id: page3.id }] } },
        scale_field => { logic: { rules: [{ if: 1, goto_page_id: page1.id }] } }
      )

      assert_status 422
      expect(select_field.reload.title_multiloc).not_to eq({ 'en' => 'Changed title' })
      expect(select_field.logic).to eq({})
      expect(scale_field.reload.logic).to eq({})
    end

    example '[error] Persists no unresolved temp id when the target page does not exist', document: false do
      do_request form_params(page1 => { logic: { next_page_id: 'TEMP-ID-MISSING' } })

      assert_status 422
      expect(logic_errors).to eq({ '0': [{ error: 'invalid_next_page_id', value: 'TEMP-ID-MISSING' }] })
      expect(page1.reload.logic).to eq({})
    end

    context 'when logic is invalid' do
      let(:invalid_logic) { { logic: { rules: [{ if: 1, goto_page_id: page1.id }] } } }

      example '[error] Keeps a field left out of the request and its answers', document: false do
        text_field = create(:custom_field_text, resource: custom_form, key: 'text_field')
        response = create(:idea, project: phase.project, creation_phase: phase, phases: [phase], custom_field_answers: [
          build(:custom_field_answer, key: 'text_field', value: 'Keep me', custom_field: text_field)
        ])
        do_request form_params(scale_field => invalid_logic)

        assert_status 422
        expect(CustomField.exists?(text_field.id)).to be true
        expect(CustomFieldAnswer.where(answerable: response).pluck(:key, :value)).to eq [['text_field', 'Keep me']]
      end

      example '[error] Creates no new field and no new option', document: false do
        request = form_params(
          select_field => {
            options: [
              { id: cat.id, title_multiloc: cat.title_multiloc },
              { id: dog.id, title_multiloc: dog.title_multiloc },
              { temp_id: 'TEMP-ID-OPTION', title_multiloc: { en: 'Bird' } }
            ]
          },
          scale_field => invalid_logic
        )
        request[:custom_fields].insert(4, { temp_id: 'TEMP-ID-PAGE', input_type: 'page', page_layout: 'default', title_multiloc: { en: 'New page' } })

        expect { do_request request }.not_to change(CustomField, :count)
        assert_status 422
        expect(select_field.options.reload.pluck(:key)).to match_array %w[cat dog]
      end

      example '[error] Keeps an option left out of the request and the rule that uses it', document: false do
        select_field.update!(logic: { rules: [{ if: dog.id, goto_page_id: page3.id }] })
        do_request form_params(
          select_field => { options: [{ id: cat.id, title_multiloc: cat.title_multiloc }], logic: { rules: [{ if: dog.id, goto_page_id: page3.id }] } },
          scale_field => invalid_logic
        )

        assert_status 422
        expect(select_field.options.reload.pluck(:key)).to match_array %w[cat dog]
        expect(select_field.reload.logic).to eq({ 'rules' => [{ 'if' => dog.id, 'goto_page_id' => page3.id }] })
      end

      example '[error] Does not mark the form as updated and logs no activity', document: false do
        custom_form.update_column(:fields_last_updated_at, 1.day.ago)
        last_updated_at = custom_form.reload.fields_last_updated_at

        expect { do_request form_params(select_field => { title_multiloc: { en: 'Changed title' } }, scale_field => invalid_logic) }
          .not_to have_enqueued_job(LogActivityJob)
        assert_status 422
        expect(custom_form.reload.fields_last_updated_at).to eq last_updated_at
      end
    end

    context 'with a rating question' do
      let!(:rating_field) { create(:custom_field_rating, resource: custom_form, key: 'rating_field', maximum: 5, required: false) }

      def rating_request(**attributes)
        form_params.tap do |request|
          request[:custom_fields].insert(4, field_params(rating_field, **attributes))
        end
      end

      example 'Stores rules on every value of the rating and the catch-all rules', document: false do
        rules = (1..5).map { |value| { if: value, goto_page_id: value.odd? ? page3.id : form_end.id } } +
                [{ if: 'any_other_answer', goto_page_id: form_end.id }, { if: 'no_answer', goto_page_id: page3.id }]
        do_request rating_request(logic: { rules: })

        assert_status 200
        expect(response_logic(rating_field)).to eq({ rules: })
        expect(rating_field.reload.logic['rules'].pluck('if')).to eq [1, 2, 3, 4, 5, 'any_other_answer', 'no_answer']
      end

      example 'Keeps the rules of a rating question when another attribute changes', document: false do
        rating_field.update!(logic: { rules: [{ if: 1, goto_page_id: form_end.id }] })
        do_request rating_request(title_multiloc: { en: 'Changed title' }, logic: { rules: [{ if: 1, goto_page_id: form_end.id }] })

        assert_status 200
        expect(rating_field.reload.title_multiloc).to eq({ 'en' => 'Changed title' })
        expect(rating_field.logic).to eq({ 'rules' => [{ 'if' => 1, 'goto_page_id' => form_end.id }] })
      end

      example 'Removes the rules of a rating question when the request sends empty logic', document: false do
        rating_field.update!(logic: { rules: [{ if: 1, goto_page_id: form_end.id }] })
        do_request rating_request(logic: { rules: [] })

        assert_status 200
        expect(rating_field.reload.logic).to eq({ 'rules' => [] })
      end

      example 'Stores the rules of a new rating question', document: false do
        request = form_params
        request[:custom_fields].insert(4, {
          input_type: 'rating',
          title_multiloc: { en: 'New rating' },
          maximum: 3,
          logic: { rules: [{ if: 3, goto_page_id: form_end.id }] }
        })
        do_request request

        assert_status 200
        new_rating = CustomField.find_by(resource: custom_form, title_multiloc: { en: 'New rating' })
        expect(new_rating.logic).to eq({ 'rules' => [{ 'if' => 3, 'goto_page_id' => form_end.id }] })
      end

      example 'Replaces the temp id of a new page in a rating rule by the page id', document: false do
        request = rating_request(logic: { rules: [{ if: 2, goto_page_id: 'TEMP-ID-PAGE' }] })
        request[:custom_fields].insert(5, { temp_id: 'TEMP-ID-PAGE', input_type: 'page', page_layout: 'default', title_multiloc: { en: 'New page' } })
        do_request request

        assert_status 200
        new_page = CustomField.find_by(resource: custom_form, title_multiloc: { en: 'New page' })
        expect(rating_field.reload.logic).to eq({ 'rules' => [{ 'if' => 2, 'goto_page_id' => new_page.id }] })
      end

      example 'Drops rating rules on a string or on a value outside the rating without an error', document: false do
        rules = [0, 1, '2', 6, 'yes'].map { |value| { if: value, goto_page_id: form_end.id } }
        do_request rating_request(logic: { rules: })

        assert_status 200
        expect(rating_field.reload.logic['rules'].pluck('if')).to eq [1]
      end

      example 'Drops the no_answer rule of a rating question that is made required', document: false do
        rules = [{ if: 'no_answer', goto_page_id: page3.id }, { if: 'any_other_answer', goto_page_id: form_end.id }]
        do_request rating_request(required: true, logic: { rules: })

        assert_status 200
        expect(rating_field.reload.logic['rules'].pluck('if')).to eq ['any_other_answer']
      end

      example 'Drops the rating rules above a lowered maximum', document: false do
        rules = [{ if: 3, goto_page_id: page3.id }, { if: 4, goto_page_id: form_end.id }]
        do_request rating_request(maximum: 3, logic: { rules: })

        assert_status 200
        expect(rating_field.reload.maximum).to eq 3
        expect(rating_field.logic['rules'].pluck('if')).to eq [3]
      end

      example '[error] Rejects a rating rule that jumps backwards and persists nothing', document: false do
        do_request rating_request(title_multiloc: { en: 'Changed title' }, logic: { rules: [{ if: 1, goto_page_id: page1.id }] })

        assert_status 422
        expect(logic_errors).to eq({ '4': [{ error: 'target_before_source_not_allowed', value: page1.id }] })
        expect(rating_field.reload.title_multiloc).not_to eq({ 'en' => 'Changed title' })
        expect(rating_field.logic).to eq({})
      end

      example '[error] Rejects a rating rule that targets a question', document: false do
        text_field = create(:custom_field_text, resource: custom_form)
        request = rating_request(logic: { rules: [{ if: 1, goto_page_id: text_field.id }] })
        request[:custom_fields].insert(6, field_params(text_field))
        do_request request

        assert_status 422
        expect(logic_errors).to eq({ '4': [{ error: 'only_page_allowed_as_target', value: text_field.id }] })
      end

      example '[error] Rejects a rating rule with an invalid structure', document: false do
        do_request rating_request(logic: { rules: [{ if: 1, goto_page_id: form_end.id, extra: 'x' }] })

        assert_status 422
        expect(logic_errors).to eq({ '4': [{ error: 'invalid_structure' }] })
      end
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

    context 'with a multiselect question created before multiselect logic was discontinued' do
      let!(:multiselect_field) { create(:custom_field_multiselect, :with_options, resource: custom_form, created_at: Time.utc(2025, 6, 1)) }
      let(:first_option) { multiselect_field.options.first }
      let(:legacy_rules) { [{ 'if' => first_option.id, 'goto_page_id' => page3.id }] }

      before { multiselect_field.update_column(:logic, { 'rules' => legacy_rules }) }

      def multiselect_request(**attributes)
        form_params.tap do |request|
          request[:custom_fields].insert(2, field_params(multiselect_field, **attributes))
        end
      end

      example 'Keeps its rules on save when the request does not send logic', document: false do
        do_request multiselect_request

        assert_status 200
        expect(multiselect_field.reload.logic).to eq({ 'rules' => legacy_rules })
      end

      example 'Keeps its rules on save when another attribute changes', document: false do
        do_request multiselect_request(title_multiloc: { en: 'Changed title' }, logic: { rules: legacy_rules })

        assert_status 200
        expect(multiselect_field.reload.title_multiloc).to eq({ 'en' => 'Changed title' })
        expect(response_logic(multiselect_field)).to eq({ rules: legacy_rules.map(&:symbolize_keys) })
      end

      example 'Stores changes to its rules', document: false do
        rules = [{ if: first_option.id, goto_page_id: form_end.id }, { if: 'any_other_answer', goto_page_id: page3.id }]
        do_request multiselect_request(logic: { rules: })

        assert_status 200
        expect(response_logic(multiselect_field)).to eq({ rules: })
      end

      example 'Drops the rule of one of its options deleted in the same request', document: false do
        options = multiselect_field.options.drop(1).map { |option| { id: option.id, title_multiloc: option.title_multiloc } }
        do_request multiselect_request(options:, logic: { rules: legacy_rules })

        assert_status 200
        expect(multiselect_field.reload.logic).to eq({ 'rules' => [] })
      end

      example '[error] Rejects a rule of it that jumps backwards', document: false do
        do_request multiselect_request(logic: { rules: [{ if: first_option.id, goto_page_id: page1.id }] })

        assert_status 422
        expect(logic_errors).to eq({ '2': [{ error: 'target_before_source_not_allowed', value: page1.id }] })
        expect(multiselect_field.reload.logic).to eq({ 'rules' => legacy_rules })
      end
    end

    example 'Keeps the rules of a multiselect image question created before multiselect logic was discontinued', document: false do
      image_field = create(:custom_field_multiselect_image, :with_options, resource: custom_form, created_at: Time.utc(2025, 6, 1))
      rules = [{ 'if' => image_field.options.first.id, 'goto_page_id' => page3.id }]
      image_field.update_column(:logic, { 'rules' => rules })
      request = form_params
      request[:custom_fields].insert(2, field_params(image_field))
      do_request request

      assert_status 200
      expect(image_field.reload.logic).to eq({ 'rules' => rules })
    end

    example 'Wipes the rules of a multiselect question created after multiselect logic was discontinued', document: false do
      multiselect_field = create(:custom_field_multiselect, :with_options, resource: custom_form)
      multiselect_field.update_column(:logic, { 'rules' => [{ 'if' => multiselect_field.options.first.id, 'goto_page_id' => page3.id }] })
      request = form_params
      request[:custom_fields].insert(2, field_params(multiselect_field))
      do_request request

      assert_status 200
      expect(multiselect_field.reload.logic).to eq({})
    end

    example 'Drops new rules of a multiselect question created before multiselect logic was discontinued that had none', document: false do
      multiselect_field = create(:custom_field_multiselect, :with_options, resource: custom_form, created_at: Time.utc(2025, 6, 1))
      request = form_params
      request[:custom_fields].insert(2, field_params(multiselect_field, logic: { rules: [{ if: multiselect_field.options.first.id, goto_page_id: page3.id }] }))
      do_request request

      assert_status 200
      expect(multiselect_field.reload.logic).to eq({})
    end

    example 'Keeps the rules of a ranking question (currently existing bug, B8)', document: false do
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
