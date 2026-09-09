# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'CustomBlockAISessions' do
  explanation 'Authoring sessions for the custom block AI loop.'

  before do
    set_api_content_type
    SettingsService.new.activate_feature!('custom_page_blocks')
  end

  let(:custom_block) { create(:custom_block) }

  post 'web_api/v1/custom_blocks/:custom_block_id/ai_sessions' do
    let(:custom_block_id) { custom_block.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Create an AI authoring session' do
        assert_status 201

        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'custom_block_ai_session'
        expect(json_response.dig(:data, :attributes, :transcript_length)).to eq 0
      end
    end

    context 'when visitor' do
      example_request '[error] Create an AI authoring session without authorization' do
        assert_status 401
      end
    end
  end

  post 'web_api/v1/custom_block_ai_sessions/:id/turns' do
    with_options scope: :turn do
      parameter :user_message, 'The admin message that starts a loop round'
      parameter :tool_results, 'Results of client-executed tool calls'
    end

    let(:session) { create(:custom_block_ai_session, custom_block: custom_block) }
    let(:id) { session.id }

    context 'when admin' do
      before do
        admin_header_token
        service = instance_double(ContentBuilder::CustomBlockAuthoringService)
        allow(ContentBuilder::CustomBlockAuthoringService).to receive(:new).and_return(service)
        allow(service).to receive(:run).and_return(service_result)
      end

      let(:service_result) do
        {
          assistant_text: 'On it.',
          tool_calls: [{ id: 'tu_1', name: 'set_source', input: { 'source' => 'x' } }],
          stop_reason: 'tool_use'
        }
      end

      example 'Run a turn with a user message' do
        do_request(turn: { user_message: 'Build a welcome block' })

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :type)).to eq 'custom_block_ai_turn'
        expect(json_response.dig(:data, :attributes, :assistant_text)).to eq 'On it.'
        expect(json_response.dig(:data, :attributes, :tool_calls).first[:name]).to eq 'set_source'
      end

      example 'Run a turn with tool results', document: false do
        do_request(
          turn: {
            tool_results: [{ tool_use_id: 'tu_1', content: '{"ok":true}', is_error: false }]
          }
        )

        assert_status 200
        expect(ContentBuilder::CustomBlockAuthoringService).to have_received(:new)
      end

      example '[error] Run a turn with neither message nor tool results', document: false do
        do_request(turn: { user_message: '' })

        assert_status 422
      end
    end

    context 'when visitor' do
      example '[error] Run a turn without authorization', document: false do
        do_request(turn: { user_message: 'hi' })

        assert_status 401
      end
    end
  end
end
