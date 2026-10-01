# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AI assistant messages' do
  explanation 'Messages that the user sends to the AI assistant. Each one starts a turn of the assistant in the background.'

  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature!('ai_assistant')
  end

  post 'web_api/v1/ai_assistant_conversations/:ai_assistant_conversation_id/messages' do
    with_options scope: :ai_assistant_message do
      parameter :content, 'The text of the message', required: false
      parameter :file_ids, 'IDs of project files (PDF, Markdown or text) to share with the assistant', required: false, type: :array
    end

    let(:conversation) { create(:ai_assistant_conversation) }
    let(:ai_assistant_conversation_id) { conversation.id }
    let(:content) { 'Create a survey about our park.' }

    context 'when the owner' do
      before { header_token_for(conversation.user) }

      example 'Send a message', :active_job_que_adapter do
        expect { do_request }.to change { QueJob.by_job_class(AIAssistant::TurnJob).count }.by(1)

        assert_status 201
        expect(response_data[:attributes]).to include(role: 'user', content: 'Create a survey about our park.', position: 1)
        expect(conversation.reload.status).to eq('running')
      end

      example '[error] Send a message while the assistant is busy', document: false do
        conversation.update!(status: 'awaiting_approval')

        do_request

        assert_status 409
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'conversation_busy'
      end

      example '[error] Send an empty message', document: false do
        do_request(ai_assistant_message: { content: '' })

        assert_status 422
        expect(json_response_body.dig(:errors, :content, 0, :error)).to eq 'blank'
      end

      example '[error] Share a file that may not be processed by AI', :active_job_que_adapter, document: false do
        file = create(:file, projects: [conversation.context.project], ai_processing_allowed: false)

        do_request(ai_assistant_message: { content:, file_ids: [file.id] })

        assert_status 422
        expect(json_response_body.dig(:errors, :file_ids, 0, :error)).to eq 'ai_processing_not_allowed'
      end
    end

    context 'when another super admin' do
      before { header_token_for(create(:super_admin)) }

      example '[error] Send a message in the conversation of someone else', document: false do
        do_request
        assert_status 401
      end
    end
  end
end
