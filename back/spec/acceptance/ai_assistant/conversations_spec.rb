# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AI assistant conversations' do
  explanation 'Chats with the AI assistant about one record, such as the survey of a phase.'

  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature!('ai_assistant')
  end

  let(:super_admin) { create(:super_admin) }
  let(:phase) { create(:native_survey_phase, project: create(:project, :draft)) }

  get 'web_api/v1/ai_assistant_conversations' do
    parameter :context_key, 'Which assistant context, e.g. survey_builder', required: true
    parameter :context_id, 'The record the conversation is about', required: true

    let(:context_key) { 'survey_builder' }
    let(:context_id) { phase.id }

    context 'when super admin' do
      before { header_token_for(super_admin) }

      example 'List the latest conversation of the current user in a context' do
        create(:ai_assistant_conversation, user: super_admin, context: phase, created_at: 1.day.ago)
        latest = create(:ai_assistant_conversation, user: super_admin, context: phase)
        create(:ai_assistant_conversation, context: phase)

        do_request

        assert_status 200
        expect(response_data.pluck(:id)).to eq([latest.id])
      end
    end

    context 'when admin' do
      before { header_token_for(create(:admin)) }

      example 'List no conversations', document: false do
        do_request
        assert_status 200
        expect(response_data).to be_empty
      end
    end
  end

  get 'web_api/v1/ai_assistant_conversations/:id' do
    let(:conversation) { create(:ai_assistant_conversation, user: super_admin, context: phase) }
    let(:id) { conversation.id }

    before do
      create(:ai_assistant_message, conversation:)
      create(:ai_assistant_tool_call, message: create(:ai_assistant_message, conversation:, role: 'assistant'), result: 'secret result')
    end

    context 'when the owner' do
      before { header_token_for(super_admin) }

      example 'Get a conversation with its messages and tool calls' do
        do_request

        assert_status 200
        expect(response_data[:attributes]).to include(context_key: 'survey_builder', status: 'idle')
        expect(json_response_body[:included].pluck(:type)).to contain_exactly(
          'ai_assistant_message', 'ai_assistant_message', 'ai_assistant_tool_call'
        )
        tool_call = json_response_body[:included].find { |resource| resource[:type] == 'ai_assistant_tool_call' }
        expect(tool_call[:attributes].keys).to contain_exactly(:name, :arguments, :status, :created_at)
      end
    end

    context 'when another super admin' do
      before { header_token_for(create(:super_admin)) }

      example '[error] Get the conversation of someone else', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when the feature is disabled' do
      before do
        header_token_for(super_admin)
        SettingsService.new.deactivate_feature!('ai_assistant')
      end

      example '[error] Get a conversation', document: false do
        do_request
        assert_status 401
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'ai_assistant_disabled'
      end
    end
  end

  post 'web_api/v1/ai_assistant_conversations' do
    with_options scope: :ai_assistant_conversation do
      parameter :context_key, 'Which assistant context, e.g. survey_builder', required: true
      parameter :context_id, 'The record the conversation is about', required: true
      parameter :locale, 'The language of the conversation', required: true
    end

    let(:context_key) { 'survey_builder' }
    let(:context_id) { phase.id }
    let(:locale) { 'en' }

    context 'when super admin' do
      before { header_token_for(super_admin) }

      example 'Start a new conversation' do
        do_request

        assert_status 201
        expect(AIAssistant::Conversation.find(response_data[:id])).to have_attributes(
          user: super_admin, context: phase, context_key: 'survey_builder', locale: 'en', status: 'idle'
        )
      end

      example '[error] Start a conversation in an unknown context', document: false do
        do_request(ai_assistant_conversation: { context_key: 'nope', context_id:, locale: })
        assert_status 422
        expect(json_response_body.dig(:errors, :context_key, 0, :error)).to eq 'inclusion'
      end

      example '[error] Start a conversation about a phase that is not a native survey', document: false do
        do_request(ai_assistant_conversation: { context_key:, context_id: create(:phase).id, locale: })
        assert_status 422
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'context_unavailable'
      end
    end

    context 'when admin' do
      before { header_token_for(create(:admin)) }

      example '[error] Start a conversation', document: false do
        do_request
        assert_status 401
      end
    end
  end
end
