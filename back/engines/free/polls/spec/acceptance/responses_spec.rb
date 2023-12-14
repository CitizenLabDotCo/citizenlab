# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Poll Responses' do
  explanation 'A poll response is an answer by a user to all poll questions associated to the same participation context. A poll response contains response options that associate the options picked by the user'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin, locale: 'en')
    header_token_for @user
  end

  get 'web_api/v1/phases/:phase_id/poll_responses/as_xlsx' do
    context 'non-anonymous poll' do
      before do
        @phase = create(:single_phase_poll_project).phases.first
        @q1 = create(:poll_question, :with_options, phase: @phase)
        @q2 = create(:poll_question, :with_options, phase: @phase)
        r1 = create(:poll_response, phase: @phase)
        r1.update!(response_options: [@q1, @q2].map { |q| create(:poll_response_option, response: r1, option: q.options.first) })
        r2 = create(:poll_response, phase: @phase)
        r2.update!(response_options: [@q1, @q2].map { |q| create(:poll_response_option, response: r2, option: q.options.last) })
        @q1.options.first.destroy!
        @q2.destroy!
        @q3 = create(:poll_question, :with_options, phase: @phase)
      end

      let(:phase_id) { @phase.id }

      example_request 'XLSX export for a non-anonymous poll' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        worksheet[0].cells.map(&:value).map(&:downcase)

        expect(worksheet.count).to eq 3
        expect(worksheet[0].cells.map(&:value)).to include 'User ID'
        expect(worksheet[0].cells.map(&:value)).to include @q1.title_multiloc['en']
      end
    end

    context 'anonymous poll' do
      before do
        @phase = create(:single_phase_poll_project, phase_attrs: { poll_anonymous: true }).phases.first
        @q1 = create(:poll_question, :with_options, phase: @phase)
        @u1 = create(:user)
        @r1 = create(:poll_response,
          user: @u1,
          phase: @phase,
          response_options: [create(:poll_response_option, option: @q1.options.first)])
      end

      let(:phase_id) { @phase.id }

      example_request 'XLSX export for an anonymous poll' do
        expect(status).to eq 200
        worksheet = RubyXL::Parser.parse_buffer(response_body).worksheets[0]
        expect(worksheet[0][0].value.to_s).to eq @q1.title_multiloc['en']
        worksheet.each do |row|
          row.cells.each do |cell|
            expect(cell.value.to_s).not_to include @u1.id
            expect(cell.value.to_s).not_to include @u1.email
          end
        end
      end

      describe 'when resident' do
        before { resident_header_token }

        example '[error] XLSX export', document: false do
          do_request
          expect(status).to eq 401
        end
      end
    end
  end

  get 'web_api/v1/phases/:phase_id/poll_responses/responses_count' do
    context 'non-anonymous poll' do
      before do
        @phase = create(:single_phase_poll_project).phases.first
        @q1 = create(:poll_question, :with_options, phase: @phase)
        @q2 = create(:poll_question, :with_options, phase: @phase)
        @r1 = create(:poll_response, phase: @phase)
        @r1.update!(response_options: [@q1, @q2].map { |q| create(:poll_response_option, response: @r1, option: q.options.first) })
        @r2 = create(:poll_response, phase: @phase)
        @r2.update!(response_options: [@q1, @q2].map { |q| create(:poll_response_option, response: @r2, option: q.options.last) })
      end

      let(:phase_id) { @phase.id }

      example_request 'response counts' do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response[:data][:attributes][:series][:options][@q1.options.first.id.to_sym]).to eq 1
      end
    end
  end

  post 'web_api/v1/phases/:phase_id/poll_responses' do
    parameter :response_options_attributes, 'Array with response option objects', required: true, scope: :response
    parameter :option_id, 'The id of the option the user selected', required: true, scope: %i[response response_options_attributes]

    ValidationErrorHelper.new.error_fields(self, Polls::Response)
    ValidationErrorHelper.new.error_fields(self, Polls::ResponseOption)

    let(:project) { create(:project_with_current_phase, current_phase_attrs: { participation_method: 'poll' }) }
    let(:phase) { project.phases[2] }
    let(:phase_id) { phase.id }
    let(:q1) { create(:poll_question, :with_options, phase: phase) }
    let(:q2) { create(:poll_question, :with_options, phase: phase) }
    let(:response_options_attributes) do
      [
        { option_id: q1.options.first.id },
        { option_id: q2.options.last.id }
      ]
    end

    example_request 'Create a poll response in a phase' do
      expect(response_status).to eq 201
    end
  end
end
