# frozen_string_literal: true

require 'rails_helper'

# BaseTool.for cross-cutting behaviour: activities tagged channel 'mcp' (Layer 2), and
# unexpected tool errors reported to Sentry + re-raised, expected ones not (Layer 3).
describe McpServer::BaseTool do
  let(:current_user) { create(:super_admin) }

  describe 'activity channel (Layer 2)' do
    it "tags activities logged during a tool run with the 'mcp' channel" do
      expect do
        run_mcp_tool(
          McpServer::Tools::CreateProject,
          params: { title_multiloc: { 'en' => 'New project' } },
          current_user:
        )
      end.to have_enqueued_job(LogActivityJob)
        .with(an_instance_of(Project), 'created', current_user, a_kind_of(Integer), a_hash_including(channel: 'mcp'))
    end

    it 'resets the channel after the tool run' do
      run_mcp_tool(McpServer::Tools::ListAreas, params: {}, current_user:)
      expect(Current.activity_channel).to be_nil
    end
  end

  describe 'error reporting to Sentry (Layer 3)' do
    context 'when a tool raises an unexpected error' do
      before do
        allow_any_instance_of(McpServer::Tools::ListAreas::Runner)
          .to receive(:run).and_raise(error)
      end

      let(:error) { RuntimeError.new('boom') }

      it 'reports it to Sentry and re-raises' do
        expect(ErrorReporter).to receive(:report).with(error)

        expect { run_mcp_tool(McpServer::Tools::ListAreas, params: {}, current_user:) }
          .to raise_error(error)
      end
    end

    context 'when a tool raises an expected (user-facing) error' do
      before do
        allow_any_instance_of(McpServer::Tools::ListAreas::Runner)
          .to receive(:run).and_raise(ActiveRecord::RecordInvalid.new(Area.new))
      end

      it 'does not report it to Sentry, but still re-raises' do
        expect(ErrorReporter).not_to receive(:report)

        expect { run_mcp_tool(McpServer::Tools::ListAreas, params: {}, current_user:) }
          .to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context 'when a tool raises Pundit::NotAuthorizedError' do
      before do
        allow_any_instance_of(McpServer::Tools::ListAreas::Runner)
          .to receive(:run).and_raise(Pundit::NotAuthorizedError)
      end

      it 'returns a clean error response without reporting to Sentry' do
        expect(ErrorReporter).not_to receive(:report)

        response = run_mcp_tool(McpServer::Tools::ListAreas, params: {}, current_user:)
        expect(response).to be_error
      end
    end
  end
end
