# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Poll Questions' do
  explanation 'A poll question has multiple poll options that can be answered by users. It is tied to a participation context with participation_method `poll`'

  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/projects/:participation_context_id/poll_questions' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of questions per page'
    end

    before do
      @project = create(:continuous_poll_project)
      @questions = create_list(:poll_question, 3, :with_options, participation_context: @project)
      create(:poll_question)
    end

    let(:participation_context_id) { @project.id }
    example_request 'List all questions in a poll project' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map { |d| d[:relationships][:options][:data].size }).to eq [3, 3, 3]
      expect(json_response[:included].pluck(:id)).to match_array(@questions.flat_map { |q| q.options.map(&:id) })
    end
  end

  get 'web_api/v1/phases/:participation_context_id/poll_questions' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of questions per page'
    end

    before do
      @phase = create(:poll_phase)
      @questions = create_list(:poll_question, 3, :with_options, participation_context: @phase)
      create(:poll_question)
    end

    let(:participation_context_id) { @phase.id }
    example_request 'List all questions in a poll phase' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map { |d| d[:relationships][:options][:data].size }).to eq [3, 3, 3]
      expect(json_response[:included].pluck(:id)).to match_array(@questions.flat_map { |q| q.options.map(&:id) })
    end
  end

  get 'web_api/v1/poll_questions/:id' do
    before do
      @question = create(:poll_question)
    end

    let(:id) { @question.id }

    example_request 'Get one question by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :question_type)).to eq 'single_option'
      expect(json_response.dig(:data, :id)).to eq @question.id
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/poll_questions' do
      with_options scope: :question do
        parameter :participation_context_id, 'The id of the phase/project the question belongs to', required: true
        parameter :participation_context_type, 'The type of the participation context (Project or Phase)', required: true
        parameter :title_multiloc, 'The question, as a multiloc string', required: true
        parameter :question_type, "Either #{Polls::Question::QUESTION_TYPES.join(', ')}. Defaults to 'single_option'", required: false
        parameter :max_options, "The maximum count of options a valid response can contain. Only applicable for question_type 'multiple_options'. Defaults to nil, meaning no limit.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Polls::Question)

      let(:question) { build(:poll_question) }
      let(:title_multiloc) { question.title_multiloc }
      let(:participation_context_type) { question.participation_context_type }
      let(:participation_context_id) { question.participation_context_id }
      let(:question_type) { question.question_type }

      example_request 'Create a question' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :ordering)).to eq 0
        expect(json_response.dig(:data, :attributes, :question_type)).to eq question_type
        expect(json_response.dig(:data, :attributes, :max_options)).to be_nil
        expect(json_response.dig(:data, :relationships, :participation_context, :data, :type)).to eq 'project'
        expect(json_response.dig(:data, :relationships, :participation_context, :data, :id)).to eq participation_context_id
      end
    end

    patch 'web_api/v1/poll_questions/:id' do
      with_options scope: :question do
        parameter :title_multiloc, 'The question, as a multiloc string', required: false
        parameter :question_type, "Either #{Polls::Question::QUESTION_TYPES.join(', ')}", required: false
        parameter :max_options, "The maximum count of options a valid response can contain. Only applicable for question_type 'multiple_options'. Nil means no limit.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Polls::Option)

      let(:question) { create(:poll_question) }
      let(:id) { question.id }
      let(:title_multiloc) { { 'en' => 'How green is our city?' } }
      let(:question_type) { 'multiple_options' }
      let(:max_options) { 2 }

      example_request 'Update a question' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :question_type)).to eq question_type
        expect(json_response.dig(:data, :attributes, :max_options)).to eq max_options
      end
    end

    patch 'web_api/v1/poll_questions/:id/reorder' do
      with_options scope: :question do
        parameter :ordering, 'The position, starting from 0, where the question should be at. Questions after will move down.', required: true
      end

      before do
        @project = create(:continuous_poll_project)
        @questions = create_list(:poll_question, 3, participation_context: @project)
      end

      let(:id) { @questions.last.id }
      let(:ordering) { 1 }

      example_request 'Reorder a question' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to match ordering
        expect(Polls::Question.order(:ordering)[1].id).to eq id
        expect(Polls::Question.order(:ordering).map(&:ordering)).to eq (0..2).to_a
      end
    end

    delete 'web_api/v1/poll_questions/:id' do
      let!(:id) { create(:poll_question).id }

      example 'Delete a question' do
        old_count = Polls::Question.count
        do_request
        expect(response_status).to eq 200
        expect { Polls::Question.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Polls::Question.count).to eq(old_count - 1)
      end
    end
  end
end
