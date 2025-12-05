# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Poll Options' do
  explanation 'Options are the predefined answers users can choose when responding to a poll question. Questions have multiple poll options.'

  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/poll_questions/:poll_question_id/poll_options' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of options per page'
    end

    before do
      @question = create(:poll_question, :with_options)
      create(:poll_option)
    end

    let(:poll_question_id) { @question.id }

    example_request 'List all options in a question' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map { |d| d[:relationships][:question][:data][:id] }).to eq [@question.id] * 3
    end
  end

  get 'web_api/v1/poll_options/:id' do
    before do
      @option = create(:poll_option)
    end

    let(:id) { @option.id }

    example_request 'Get one option by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @option.id
    end
  end

  context 'when admin' do
    before do
      admin_header_token
      @question = create(:poll_question, :with_options)
      @options = @question.options
    end

    post 'web_api/v1/poll_questions/:poll_question_id/poll_options' do
      with_options scope: :option do
        parameter :title_multiloc, 'The option, as a multiloc string', required: true
      end
      ValidationErrorHelper.new.error_fields(self, Polls::Option)

      let(:question) { create(:poll_question) }
      let(:poll_question_id) { question.id }
      let(:option) { build(:poll_option, question: question) }
      let(:title_multiloc) { option.title_multiloc }

      example_request 'Create an option' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :ordering)).to eq 0
        expect(json_response.dig(:data, :relationships, :question, :data, :id)).to eq question.id
      end
    end

    patch 'web_api/v1/poll_options/:id' do
      with_options scope: :option do
        parameter :title_multiloc, 'The option, as a multiloc string', required: true
      end
      ValidationErrorHelper.new.error_fields(self, Polls::Option)

      let(:option) { create(:poll_option) }
      let(:id) { option.id }
      let(:title_multiloc) { { 'en' => 'Like totally interesting' } }

      example_request 'Update an option' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch 'web_api/v1/poll_options/:id/reorder' do
      with_options scope: :option do
        parameter :ordering, 'The position, starting from 0, where the option should be at compared to other options to the same question. Options after will move down.', required: true
      end

      let(:id) { @options.last.id }
      let(:ordering) { 1 }

      example_request 'Reorder an option' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to match ordering
        expect(@question.options.order(:ordering)[1].id).to eq id
        expect(@question.options.order(:ordering).map(&:ordering)).to eq (0..2).to_a
      end
    end

    delete 'web_api/v1/poll_options/:id' do
      let!(:id) { create(:poll_option).id }

      example 'Delete an option' do
        old_count = Polls::Option.count
        do_request
        expect(response_status).to eq 200
        expect { Polls::Option.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Polls::Option.count).to eq(old_count - 1)
      end
    end
  end
end
