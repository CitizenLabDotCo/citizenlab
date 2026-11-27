# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# totalResponseCount counts the responses that saw a question, worked out by
# replaying the survey logic on each response.
resource 'Phases' do
  explanation 'Survey results of a phase with survey logic.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get 'web_api/v1/phases/:id/survey_results' do
    parameter :filter_logic_ids, 'Array of page or option ids whose skipped questions are flagged as hidden', required: false

    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase) { project.phases.first }
    let(:id) { phase.id }
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:page1) { create(:custom_field_page, resource: custom_form, key: 'page1') }
    let!(:select_field) do
      create(:custom_field_select, resource: custom_form, key: 'select_field').tap do |field|
        %w[cat dog bird].each { |key| create(:custom_field_option, custom_field: field, key: key) }
      end
    end
    let!(:scale_field) { create(:custom_field_linear_scale, resource: custom_form, key: 'scale_field', maximum: 5) }
    let!(:page2) { create(:custom_field_page, resource: custom_form, key: 'page2') }
    let!(:page2_question) { create(:custom_field_text, resource: custom_form, key: 'page2_question') }
    let!(:page3) { create(:custom_field_page, resource: custom_form, key: 'page3') }
    let!(:page3_question) { create(:custom_field_text, resource: custom_form, key: 'page3_question') }
    let!(:form_end) { create(:custom_field_form_end_page, resource: custom_form) }

    let(:cat) { select_field.options.find_by(key: 'cat') }
    let(:dog) { select_field.options.find_by(key: 'dog') }

    def respond(publication_status: 'published', **answers)
      create(
        :idea,
        project: project,
        creation_phase: phase,
        phases: [phase],
        publication_status: publication_status,
        custom_field_answers: answers.map do |key, value|
          build(:custom_field_answer, key: key.to_s, value: value, custom_field: custom_form.custom_fields.find_by(key: key.to_s))
        end
      )
    end

    def result_for(field)
      response_data.dig(:attributes, :results).find { |result| result[:customFieldId] == field.id }
    end

    def seen_counts
      [select_field, page2_question, page3_question].map { |field| result_for(field)[:totalResponseCount] }
    end

    example 'Counts a question as seen only by the responses whose path reaches it' do
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: page3.id }, { if: dog.id, goto_page_id: form_end.id }] })
      respond(select_field: 'cat', page3_question: 'a')
      respond(select_field: 'dog')
      respond(select_field: 'bird', page2_question: 'b', page3_question: 'c')

      do_request

      assert_status 200
      expect(response_data.dig(:attributes, :totalSubmissions)).to eq 3
      expect(seen_counts).to eq [3, 1, 2]
    end

    example 'Counts a question after a rating question as seen only by the responses whose rating does not skip it' do
      rating_field = create(:custom_field_rating, resource: custom_form, key: 'rating_field', maximum: 5, required: false)
      rating_field.insert_at(1)
      rating_field.update!(logic: { rules: [{ if: 1, goto_page_id: page3.id }, { if: 5, goto_page_id: form_end.id }] })
      respond(rating_field: 1, page3_question: 'a')
      respond(rating_field: 5)
      respond(rating_field: 3, page2_question: 'b', page3_question: 'c')

      do_request

      assert_status 200
      expect([rating_field, page2_question, page3_question].map { |field| result_for(field)[:totalResponseCount] }).to eq [3, 1, 2]
    end

    example 'Applies the page default when no question rule on the page matches, unlike the respondent form (currently existing bug, B6)', document: false do
      page1.update!(logic: { next_page_id: page3.id })
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: form_end.id }] })
      respond(select_field: 'dog', page2_question: 'answered in the form', page3_question: 'c')

      do_request

      assert_status 200
      expect(seen_counts).to eq [1, 0, 1]
      expect(result_for(page2_question)).to include(questionResponseCount: 0, textResponses: [])
    end

    example 'Lets a matching question rule override the page default', document: false do
      page1.update!(logic: { next_page_id: page3.id })
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: page2.id }] })
      respond(select_field: 'cat')

      do_request

      assert_status 200
      expect(seen_counts).to eq [1, 1, 1]
    end

    example 'Lets the last matching question on a page win, even when its target is nearer (currently existing bug, N2)', document: false do
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: form_end.id }] })
      scale_field.update!(logic: { rules: [{ if: 1, goto_page_id: page3.id }] })
      respond(select_field: 'cat', scale_field: 2)
      respond(select_field: 'cat', scale_field: 1)
      respond(select_field: 'dog', scale_field: 1)

      do_request

      assert_status 200
      expect(seen_counts).to eq [3, 0, 2]
    end

    example 'Applies the any_other_answer and no_answer rules of a select', document: false do
      select_field.update!(logic: { rules: [
        { if: cat.id, goto_page_id: page2.id },
        { if: 'any_other_answer', goto_page_id: form_end.id },
        { if: 'no_answer', goto_page_id: page3.id }
      ] })
      respond(select_field: 'cat')
      respond(select_field: 'dog')
      respond(scale_field: 3)

      do_request

      assert_status 200
      expect(seen_counts).to eq [3, 1, 2]
    end

    example 'Treats an answer whose option was deleted as any other answer (currently existing bug, B15)', document: false do
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: page2.id }, { if: 'any_other_answer', goto_page_id: form_end.id }] })
      respond(select_field: 'deleted_option')

      do_request

      assert_status 200
      expect(seen_counts).to eq [1, 0, 0]
    end

    example 'Ignores a linear scale rule stored with a string value (current behaviour)', document: false do
      scale_field.update!(logic: { rules: [{ if: '3', goto_page_id: form_end.id }, { if: 4, goto_page_id: form_end.id }] })
      respond(scale_field: 3)
      respond(scale_field: 4)

      do_request

      assert_status 200
      expect(seen_counts).to eq [2, 1, 1]
    end

    example 'Ignores the rules of a disabled question', document: false do
      select_field.update!(enabled: false, logic: { rules: [{ if: cat.id, goto_page_id: form_end.id }] })
      respond(select_field: 'cat')

      do_request

      assert_status 200
      expect(result_for(select_field)).to be_nil
      expect([page2_question, page3_question].map { |field| result_for(field)[:totalResponseCount] }).to eq [1, 1]
    end

    example 'Leaves draft responses out of the counts', document: false do
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: form_end.id }] })
      respond(select_field: 'dog')
      respond(select_field: 'dog', publication_status: 'draft')

      do_request

      assert_status 200
      expect(response_data.dig(:attributes, :totalSubmissions)).to eq 1
      expect(seen_counts).to eq [1, 1, 1]
    end

    example 'Leaves out the stored answers of questions the logic skipped', document: false do
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: form_end.id }] })
      respond(select_field: 'cat', page2_question: 'stored anyway')

      do_request

      assert_status 200
      expect(result_for(page2_question)).to include(totalResponseCount: 0, questionResponseCount: 0, textResponses: [])
    end

    example 'Counts every response as seen by every question without logic', document: false do
      respond(select_field: 'cat')
      respond(page3_question: 'c')

      do_request

      assert_status 200
      expect(seen_counts).to eq [2, 2, 2]
    end

    example 'Describes the logic of each option and of each page', document: false do
      page2.update!(logic: { next_page_id: form_end.id })
      select_field.update!(logic: { rules: [
        { if: cat.id, goto_page_id: page3.id },
        { if: 'any_other_answer', goto_page_id: form_end.id },
        { if: 'no_answer', goto_page_id: page2.id }
      ] })
      scale_field.update!(logic: { rules: [{ if: 5, goto_page_id: page3.id }] })
      respond(select_field: 'cat')

      do_request

      assert_status 200
      expect(result_for(select_field)[:logic]).to eq({ answer: {
        cat: { id: cat.id, nextPageNumber: 3, numQuestionsSkipped: 1 },
        dog: { id: dog.id, nextPageNumber: 4, numQuestionsSkipped: 2 },
        bird: { id: select_field.options.find_by(key: 'bird').id, nextPageNumber: 4, numQuestionsSkipped: 2 },
        no_answer: { id: "#{select_field.id}_no_answer", nextPageNumber: 2, numQuestionsSkipped: 0 }
      } })
      expect(result_for(scale_field)[:logic]).to eq({ answer: {
        '5': { id: "#{scale_field.id}_5", nextPageNumber: 3, numQuestionsSkipped: 1 }
      } })
      expect(result_for(page2)[:logic]).to eq({ nextPageNumber: 4, numQuestionsSkipped: 1 })
      expect(result_for(page1)[:logic]).to eq({})
    end

    example 'Flags the questions skipped by the given option and page ids as hidden', document: false do
      page2.update!(logic: { next_page_id: form_end.id })
      select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: page3.id }] })
      respond(select_field: 'cat')

      do_request(filter_logic_ids: [cat.id])
      assert_status 200
      expect(result_for(page2_question)[:hidden]).to be true
      expect(result_for(page2)[:hidden]).to be true
      expect(result_for(page3_question)[:hidden]).to be false

      do_request(filter_logic_ids: [page2.id])
      expect(result_for(page2_question)[:hidden]).to be false
      expect(result_for(page3_question)[:hidden]).to be true
      expect(result_for(page3)[:hidden]).to be true
    end

    example 'Flags the questions skipped by a linear scale value as hidden', document: false do
      scale_field.update!(logic: { rules: [{ if: 2, goto_page_id: form_end.id }] })
      respond(scale_field: 2)

      do_request(filter_logic_ids: ["#{scale_field.id}_2"])

      assert_status 200
      expect([page2_question, page3_question].map { |field| result_for(field)[:hidden] }).to eq [true, true]
    end

    context 'when user fields are asked in the form' do
      let!(:user_field) { create(:custom_field_select, :for_registration, :with_options, key: 'user_select_field', enabled: true) }

      before do
        Permissions::PermissionsUpdateService.new.update_all_permissions if phase.permissions.empty?
        permission = phase.permissions.find_by(action: 'posting_idea')
        permission.update!(permitted_by: 'users', user_fields_in_form: true, custom_fields_behavior: 'custom', user_data_collection: 'all_data')
        create(:permissions_custom_field, custom_field: user_field, permission: permission)
      end

      example 'Counts the user fields as seen by responses that jump to the end', document: false do
        select_field.update!(logic: { rules: [{ if: cat.id, goto_page_id: form_end.id }] })
        respond(select_field: 'cat')
        respond(select_field: 'dog')

        do_request

        assert_status 200
        user_result = response_data.dig(:attributes, :results).find { |result| result[:customFieldId] == user_field.id }
        expect(user_result[:totalResponseCount]).to eq 2
        expect(seen_counts).to eq [2, 1, 1]
      end
    end
  end
end
