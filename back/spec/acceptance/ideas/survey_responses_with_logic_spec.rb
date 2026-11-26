# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# The backend does not evaluate survey logic when a response is submitted. Only
# the respondent form decides which pages are skipped, by leaving their answers
# out of the request.
resource 'Ideas' do
  explanation 'Native survey responses to a survey with logic.'

  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)
  end

  let(:project) { create(:single_phase_native_survey_project, phase_attrs: { with_permissions: true }) }
  let(:phase) { project.phases.first }
  let(:permission) { phase.permissions.find_by(action: 'posting_idea') }
  let(:custom_form) { create(:custom_form, participation_context: phase) }
  let!(:page1) { create(:custom_field_page, resource: custom_form, key: 'page1') }
  let!(:select_field) do
    create(:custom_field_select, resource: custom_form, key: 'select_field', required: true).tap do |field|
      create(:custom_field_option, custom_field: field, key: 'skip')
      create(:custom_field_option, custom_field: field, key: 'stay')
    end
  end
  let!(:page2) { create(:custom_field_page, resource: custom_form, key: 'page2') }
  let!(:skipped_required) { create(:custom_field_text, resource: custom_form, key: 'skipped_required', required: true) }
  let!(:skipped_multiselect) { create(:custom_field_multiselect, :with_options, resource: custom_form, key: 'skipped_multiselect') }
  let!(:page3) { create(:custom_field_page, resource: custom_form, key: 'page3') }
  let!(:last_question) { create(:custom_field_text, resource: custom_form, key: 'last_question') }
  let!(:form_end) { create(:custom_field_form_end_page, resource: custom_form) }

  before do
    skip_option = select_field.options.find_by(key: 'skip')
    select_field.update!(logic: { rules: [{ if: skip_option.id, goto_page_id: page3.id }] })
  end

  def answer_rows(idea)
    CustomFieldAnswer.where(answerable: idea).pluck(:key, :value).to_h
  end

  post 'web_api/v1/phases/:phase_id/inputs' do
    with_options scope: :idea do
      parameter :publication_status, 'published or draft'
    end

    let(:phase_id) { phase.id }

    context 'when a visitor submits and permitted_by is everyone' do
      before { permission.update!(permitted_by: 'everyone', user_data_collection: 'all_data') }

      example 'Stores the answers of pages the logic skipped when the request sends them (current behaviour)', document: false do
        do_request(idea: {
          publication_status: 'published',
          select_field: 'skip',
          skipped_required: 'should have been skipped',
          skipped_multiselect: %w[option1],
          last_question: 'end'
        })

        assert_status 201
        expect(answer_rows(Idea.find(response_data[:id]))).to eq({
          'select_field' => 'skip',
          'skipped_required' => 'should have been skipped',
          'skipped_multiselect' => %w[option1],
          'last_question' => 'end'
        })
      end

      example 'Publishes without the required question of a skipped page', document: false do
        do_request(idea: { publication_status: 'published', select_field: 'skip', last_question: 'end' })

        assert_status 201
        expect(answer_rows(Idea.find(response_data[:id]))).to eq({ 'select_field' => 'skip', 'last_question' => 'end' })
      end

      example 'Publishes without the required question of a visited page (current behaviour, B11)', document: false do
        do_request(idea: { publication_status: 'published', select_field: 'stay', last_question: 'end' })

        assert_status 201
        expect(response_data.dig(:attributes, :publication_status)).to eq 'published'
      end

      example 'Publishes without any answer to a required select (current behaviour, B11)', document: false do
        do_request(idea: { publication_status: 'published', last_question: 'end' })

        assert_status 201
        expect(answer_rows(Idea.find(response_data[:id]))).to eq({ 'last_question' => 'end' })
      end
    end

    context 'when a resident saves the first page as a draft' do
      before do
        permission.update!(permitted_by: 'users')
        header_token_for create(:user)
      end

      example 'Stores the draft without enforcing anything about later pages', document: false do
        do_request(idea: { publication_status: 'draft', select_field: 'skip' })

        assert_status 201
        idea = Idea.find(response_data[:id])
        expect(idea.publication_status).to eq 'draft'
        expect(answer_rows(idea)).to eq({ 'select_field' => 'skip' })
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    let(:author) { create(:user) }
    let!(:input) do
      create(
        :idea,
        author: author,
        project: project,
        creation_phase: phase,
        phases: [phase],
        publication_status: 'draft',
        custom_field_answers: [
          build(:custom_field_answer, key: 'select_field', value: 'stay', custom_field: select_field),
          build(:custom_field_answer, key: 'skipped_required', value: 'answered before the change', custom_field: skipped_required),
          build(:custom_field_answer, key: 'skipped_multiselect', value: %w[option1], custom_field: skipped_multiselect)
        ]
      )
    end
    let(:id) { input.id }

    before do
      permission.update!(permitted_by: 'users')
      header_token_for author
    end

    example 'Keeps the answers of a page skipped after a changed answer when the request sends them (current behaviour)', document: false do
      do_request(idea: {
        publication_status: 'published',
        select_field: 'skip',
        skipped_required: 'answered before the change',
        skipped_multiselect: %w[option1],
        last_question: 'end'
      })

      assert_status 200
      expect(answer_rows(input)).to eq({
        'select_field' => 'skip',
        'skipped_required' => 'answered before the change',
        'skipped_multiselect' => %w[option1],
        'last_question' => 'end'
      })
    end

    example 'Deletes the text answer but keeps the multiselect answer of a skipped page the request leaves out (current behaviour, N3)', document: false do
      do_request(idea: { publication_status: 'published', select_field: 'skip', last_question: 'end' })

      assert_status 200
      expect(input.reload.publication_status).to eq 'published'
      expect(answer_rows(input)).to eq({
        'select_field' => 'skip',
        'skipped_multiselect' => %w[option1],
        'last_question' => 'end'
      })
    end
  end
end
