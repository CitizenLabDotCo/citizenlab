# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# Pins which custom_field_answers rows survive a PATCH. An answer whose key is
# missing from the request is deleted, which is the only thing that removes
# answers of pages a respondent skipped through survey logic.
resource 'Ideas' do
  explanation 'Inputs posted by residents: clearing of answers that are missing from an update.'

  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)
  end

  patch 'web_api/v1/ideas/:id' do
    with_options scope: :idea do
      parameter :publication_status, 'published or draft'
    end

    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:phase) { project.phases.first }
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let!(:page1) { create(:custom_field_page, resource: custom_form, key: 'page1') }
    let!(:select_field) do
      create(:custom_field_select, resource: custom_form, key: 'select_field').tap do |field|
        create(:custom_field_option, custom_field: field, key: 'cat')
        create(:custom_field_option, custom_field: field, key: 'dog')
        create(:custom_field_option, custom_field: field, key: 'other', other: true)
      end
    end
    let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'text_field') }
    let!(:multiselect_field) { create(:custom_field_multiselect, :with_options, resource: custom_form, key: 'multiselect_field') }
    let!(:sentiment_field) { create(:custom_field_sentiment_linear_scale, resource: custom_form, key: 'sentiment_field', ask_follow_up: true) }
    let!(:page2) { create(:custom_field_page, resource: custom_form, key: 'page2') }
    let!(:page2_text_field) { create(:custom_field_text, resource: custom_form, key: 'page2_text_field') }
    let!(:form_end) { create(:custom_field_form_end_page, resource: custom_form) }

    let(:author) { create(:user) }
    let(:stored_answers) do
      {
        'select_field' => 'other',
        'select_field_other' => 'A ferret',
        'text_field' => 'Hello',
        'sentiment_field' => 4,
        'sentiment_field_follow_up' => 'Because',
        'page2_text_field' => 'On page 2'
      }
    end
    let(:publication_status_before) { 'draft' }
    let!(:input) do
      create(
        :idea,
        author: author,
        project: project,
        creation_phase: phase,
        phases: [phase],
        publication_status: publication_status_before,
        custom_field_answers: stored_answers.map do |key, value|
          build(:custom_field_answer, key: key, value: value, custom_field: custom_form.custom_fields.find_by(key: key.delete_suffix('_other').delete_suffix('_follow_up')))
        end
      )
    end
    let(:id) { input.id }

    let!(:other_input) do
      create(
        :idea,
        project: project,
        creation_phase: phase,
        phases: [phase],
        custom_field_answers: [
          build(:custom_field_answer, key: 'text_field', value: 'Other idea', custom_field: text_field),
          build(:custom_field_answer, key: 'page2_text_field', value: 'Other idea page 2', custom_field: page2_text_field)
        ]
      )
    end

    def answer_rows(idea)
      CustomFieldAnswer.where(answerable: idea).pluck(:key, :value).to_h
    end

    def expect_other_input_untouched
      expect(answer_rows(other_input)).to eq({ 'text_field' => 'Other idea', 'page2_text_field' => 'Other idea page 2' })
    end

    context 'when the author updates a draft' do
      before { header_token_for author }

      example 'Deletes the rows of keys that are omitted and keeps the rows of updated keys', document: false do
        text_answer_id = CustomFieldAnswer.find_by(answerable: input, key: 'text_field').id
        page2_answer_id = CustomFieldAnswer.find_by(answerable: input, key: 'page2_text_field').id

        do_request(idea: { select_field: 'other', select_field_other: 'A ferret', text_field: 'Changed', sentiment_field: 4, sentiment_field_follow_up: 'Because' })

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('page2_text_field').merge('text_field' => 'Changed'))
        expect(CustomFieldAnswer.find_by(id: text_answer_id)&.value).to eq 'Changed'
        expect(CustomFieldAnswer.exists?(page2_answer_id)).to be false
        expect_other_input_untouched
      end

      example 'Deletes the answers of a skipped page when the request leaves them out', document: false do
        do_request(idea: stored_answers.except('page2_text_field'))

        assert_status 200
        expect(answer_rows(input).keys).not_to include('page2_text_field')
      end

      example 'Keeps the answers of a skipped page when the request still sends them', document: false do
        do_request(idea: stored_answers.merge('page2_text_field' => 'Changed on page 2'))

        assert_status 200
        expect(answer_rows(input)['page2_text_field']).to eq 'Changed on page 2'
      end

      example 'Deletes the row of a key sent as null when other keys are sent too', document: false do
        do_request(idea: stored_answers.merge('text_field' => nil))

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('text_field'))
      end

      example 'Deletes the row of a key sent as an empty string', document: false do
        do_request(idea: stored_answers.merge('text_field' => ''))

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('text_field'))
      end

      example 'Keeps all rows when the only custom field key sent is null (current behaviour)', document: false do
        do_request(idea: { text_field: nil, publication_status: 'draft' })

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers
      end

      example '[error] Fails when the request only has a null custom field key (current behaviour)', document: false do
        expect { do_request(idea: { text_field: nil }) }.to raise_error(ActionController::ParameterMissing)
        expect(answer_rows(input)).to eq stored_answers
      end

      example 'Deletes all rows but the sent one when a single key is sent', document: false do
        do_request(idea: { text_field: 'Only this' })

        assert_status 200
        expect(answer_rows(input)).to eq({ 'text_field' => 'Only this' })
        expect_other_input_untouched
      end

      example 'Keeps all rows when no custom field key is sent', document: false do
        do_request(idea: { publication_status: 'draft' })

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers
      end

      example 'Deletes the _other row when the select no longer has the other option', document: false do
        do_request(idea: stored_answers.merge('select_field' => 'cat'))

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('select_field_other').merge('select_field' => 'cat'))
      end

      example 'Deletes the _other row when it is omitted while other stays selected', document: false do
        do_request(idea: stored_answers.except('select_field_other'))

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('select_field_other'))
      end

      example 'Deletes the _other row together with its omitted select', document: false do
        do_request(idea: stored_answers.except('select_field'))

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('select_field', 'select_field_other'))
      end

      example 'Deletes the _follow_up row when it is omitted', document: false do
        do_request(idea: stored_answers.except('sentiment_field_follow_up'))

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('sentiment_field_follow_up'))
      end

      example 'Keeps the _follow_up row when only the scale answer is omitted (current behaviour)', document: false do
        do_request(idea: stored_answers.except('sentiment_field'))

        assert_status 200
        expect(answer_rows(input)).to eq(stored_answers.except('sentiment_field'))
      end

      example 'Keeps the row of a field that was disabled after it was answered', document: false do
        page2_text_field.update!(enabled: false)

        do_request(idea: stored_answers.except('page2_text_field'))

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers
      end

      example 'Deletes the rows of omitted keys when publishing the draft', document: false do
        do_request(idea: stored_answers.except('page2_text_field', 'text_field').merge('publication_status' => 'published'))

        assert_status 200
        expect(input.reload.publication_status).to eq 'published'
        expect(answer_rows(input)).to eq(stored_answers.except('page2_text_field', 'text_field'))
        expect_other_input_untouched
      end

      example 'Keeps all rows when publishing without sending any custom field key', document: false do
        do_request(idea: { publication_status: 'published' })

        assert_status 200
        expect(input.reload.publication_status).to eq 'published'
        expect(answer_rows(input)).to eq stored_answers
      end
    end

    context 'when the author updates a published response' do
      before { header_token_for author }

      let(:publication_status_before) { 'published' }

      example '[error] Cannot change the answers', document: false do
        do_request(idea: { text_field: 'Changed' })

        assert_status 401
        expect(answer_rows(input)).to eq stored_answers
      end
    end

    context 'when an admin updates a published response' do
      before { admin_header_token }

      let(:publication_status_before) { 'published' }

      example '[error] Cannot change the answers of a published survey response', document: false do
        do_request(idea: { text_field: 'Corrected by admin' })

        assert_status 401
        expect(answer_rows(input)).to eq stored_answers
      end
    end

    context 'when a project moderator updates the draft of a respondent' do
      before { header_token_for create(:project_moderator, projects: [project]) }

      example 'Deletes every answer the moderator does not send', document: false do
        do_request(idea: { text_field: 'Corrected by moderator' })

        assert_status 200
        expect(answer_rows(input)).to eq({ 'text_field' => 'Corrected by moderator' })
        expect_other_input_untouched
      end

      example 'Keeps all answers when the moderator sends no custom field key', document: false do
        do_request(idea: { publication_status: 'draft' })

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers
      end

      example 'Keeps the answer of a disabled field the moderator cannot send', document: false do
        page2_text_field.update!(enabled: false)

        do_request(idea: stored_answers.except('page2_text_field'))

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers
      end
    end

    context 'with array and hash valued answers' do
      before { header_token_for author }

      let!(:ranking_field) { create(:custom_field_ranking, :with_options, resource: custom_form, key: 'ranking_field') }
      let!(:matrix_field) { create(:custom_field_matrix_linear_scale, resource: custom_form, key: 'matrix_field') }
      let(:stored_answers) do
        {
          'text_field' => 'Hello',
          'multiselect_field' => %w[option1],
          'ranking_field' => %w[by_bike by_train],
          'matrix_field' => { 'send_more_animals_to_space' => 1, 'ride_bicycles_more_often' => 2 }
        }
      end

      example 'Keeps omitted multiselect, ranking and matrix answers (current behaviour, N3)', document: false do
        do_request(idea: { text_field: 'Hello' })

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers
      end

      example 'Keeps omitted multiselect, ranking and matrix answers when publishing (current behaviour, N3)', document: false do
        do_request(idea: { text_field: 'Hello', publication_status: 'published' })

        assert_status 200
        expect(input.reload.publication_status).to eq 'published'
        expect(answer_rows(input)).to eq stored_answers
      end

      example 'Deletes multiselect and ranking answers sent as an empty array', document: false do
        do_request(idea: stored_answers.merge('multiselect_field' => [], 'ranking_field' => []))

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers.except('multiselect_field', 'ranking_field')
      end

      example 'Deletes a matrix answer sent as an empty object', document: false do
        do_request(idea: stored_answers.merge('matrix_field' => {}))

        assert_status 200
        expect(answer_rows(input)).to eq stored_answers.except('matrix_field')
      end
    end

    context 'with user fields' do
      let(:permission) { phase.permissions.find_by(action: 'posting_idea') }
      let!(:user_field) { create(:custom_field_select, :for_registration, :with_options, key: 'user_select_field', enabled: true) }
      let(:stored_answers) do
        { 'text_field' => 'Hello', 'page2_text_field' => 'On page 2' }
      end

      before do
        Permissions::PermissionsUpdateService.new.update_all_permissions if phase.permissions.empty?
        permission.update!(permitted_by: 'users', custom_fields_behavior: 'custom')
        create(:permissions_custom_field, custom_field: user_field, permission: permission)
        input.custom_field_answers.create!(key: 'u_user_select_field', value: 'option1', custom_field: user_field)
        input.custom_field_answers.reset
      end

      context 'when user fields are asked in the form' do
        before do
          permission.update!(user_fields_in_form: true)
          header_token_for author
        end

        example 'Deletes the u_ row when the author omits it', document: false do
          do_request(idea: stored_answers)

          assert_status 200
          expect(answer_rows(input)).to eq stored_answers
        end

        example 'Updates the u_ row when the author sends it', document: false do
          do_request(idea: stored_answers.merge('u_user_select_field' => 'option2'))

          assert_status 200
          expect(answer_rows(input)).to eq stored_answers.merge('u_user_select_field' => 'option2')
        end
      end

      context 'when user fields are not asked in the form' do
        before { permission.update!(user_fields_in_form: false) }

        example 'Keeps the u_ row when the author publishes without it', document: false do
          author.custom_field_answers.create!(key: 'user_select_field', value: 'option2', custom_field: user_field)
          header_token_for author
          do_request(idea: stored_answers.merge('publication_status' => 'published'))

          assert_status 200
          expect(answer_rows(input)).to eq stored_answers.merge('u_user_select_field' => 'option1')
        end

        example 'Keeps the u_ row when an admin edits the draft', document: false do
          admin_header_token
          do_request(idea: { text_field: 'Corrected by admin' })

          assert_status 200
          expect(answer_rows(input)).to eq({ 'text_field' => 'Corrected by admin', 'u_user_select_field' => 'option1' })
        end
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    let(:project) { create(:single_phase_ideation_project) }
    let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let!(:text_field) { create(:custom_field_text, resource: custom_form, key: 'extra_text') }
    let!(:number_field) { create(:custom_field_number, resource: custom_form, key: 'extra_number') }
    let(:author) { create(:user) }
    let!(:input) do
      create(
        :idea,
        author: author,
        project: project,
        phases: project.phases,
        custom_field_answers: [
          build(:custom_field_answer, key: 'extra_text', value: 'Hello', custom_field: text_field),
          build(:custom_field_answer, key: 'extra_number', value: 7, custom_field: number_field)
        ]
      )
    end
    let(:id) { input.id }

    def answer_rows(idea)
      CustomFieldAnswer.where(answerable: idea).pluck(:key, :value).to_h
    end

    context 'when the author edits a published idea' do
      before { header_token_for author }

      example 'Deletes the extra answers the author does not send', document: false do
        do_request(idea: { extra_text: 'Changed' })

        assert_status 200
        expect(answer_rows(input)).to eq({ 'extra_text' => 'Changed' })
      end

      example 'Keeps the extra answers when only the title is sent', document: false do
        do_request(idea: { title_multiloc: { en: 'New title' } })

        assert_status 200
        expect(answer_rows(input)).to eq({ 'extra_text' => 'Hello', 'extra_number' => 7 })
      end
    end

    context 'when an admin edits a published idea' do
      before { admin_header_token }

      example 'Deletes the extra answers the admin does not send', document: false do
        do_request(idea: { extra_number: 8 })

        assert_status 200
        expect(answer_rows(input)).to eq({ 'extra_number' => 8 })
      end

      example 'Keeps the extra answers when only the status is changed', document: false do
        do_request(idea: { idea_status_id: create(:idea_status).id })

        assert_status 200
        expect(answer_rows(input)).to eq({ 'extra_text' => 'Hello', 'extra_number' => 7 })
      end
    end
  end
end
