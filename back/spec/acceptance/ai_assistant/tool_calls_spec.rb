# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AI assistant tool calls' do
  explanation 'Changes proposed by the AI assistant. They only run once the user approves them.'

  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature!('ai_assistant')
  end

  let(:conversation) { create(:ai_assistant_conversation, status: 'awaiting_approval') }
  let(:phase) { conversation.context }
  let(:tool_call) do
    create(
      :ai_assistant_tool_call,
      message: create(:ai_assistant_message, conversation:, role: 'assistant'),
      arguments: {
        'fields' => [
          { 'input_type' => 'page', 'page_layout' => 'default', 'title_multiloc' => {} },
          { 'input_type' => 'text', 'title_multiloc' => { 'en' => 'What do you like?' }, 'required' => false, 'enabled' => true },
          { 'input_type' => 'page', 'page_layout' => 'default', 'key' => 'form_end', 'title_multiloc' => {} }
        ]
      },
      bound_arguments: { 'container_type' => 'phase', 'container_id' => phase.id }
    )
  end
  let(:id) { tool_call.id }

  post 'web_api/v1/ai_assistant_tool_calls/:id/approve' do
    context 'when the owner' do
      before { header_token_for(conversation.user) }

      example 'Approve a proposed change', :active_job_que_adapter do
        do_request

        assert_status 200
        expect(response_data[:attributes]).to include(name: 'replace_form_fields', status: 'executed')
        expect(phase.reload.custom_form.custom_fields.map(&:input_type)).to eq(%w[page text page])
        expect(conversation.reload.status).to eq('running')
      end

      example '[error] Approve a change that was already decided', document: false do
        tool_call.update!(status: 'rejected')

        do_request

        assert_status 409
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'tool_call_not_proposed'
      end

      example '[error] Approve an expired proposal', document: false do
        tool_call.update!(created_at: 2.days.ago)

        do_request

        assert_status 422
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'tool_call_expired'
      end
    end

    context 'when another super admin' do
      before { header_token_for(create(:super_admin)) }

      example '[error] Approve the proposal of someone else', document: false do
        do_request
        assert_status 401
        expect(phase.reload.custom_form).to be_nil
      end
    end
  end

  post 'web_api/v1/ai_assistant_tool_calls/:id/reject' do
    with_options scope: :ai_assistant_tool_call do
      parameter :reason, 'Why the change is rejected; the assistant uses it to adjust', required: false
    end

    let(:reason) { 'Fewer questions please' }

    context 'when the owner' do
      before { header_token_for(conversation.user) }

      example 'Reject a proposed change', :active_job_que_adapter do
        do_request

        assert_status 200
        expect(response_data[:attributes]).to include(status: 'rejected', reason: 'Fewer questions please')
        expect(phase.reload.custom_form).to be_nil
      end
    end
  end
end
