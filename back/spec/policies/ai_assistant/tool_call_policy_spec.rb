# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::ToolCallPolicy do
  subject(:policy) { described_class.new(user, tool_call) }

  let(:conversation) { create(:ai_assistant_conversation, user: owner) }
  let(:tool_call) { create(:ai_assistant_tool_call, message: create(:ai_assistant_message, conversation:, role: 'assistant', content: nil)) }
  let(:owner) { create(:super_admin) }

  context 'for the super admin who owns the conversation' do
    let(:user) { owner }

    it { is_expected.to permit(:approve) }
    it { is_expected.to permit(:reject) }
  end

  context 'for another super admin' do
    let(:user) { create(:super_admin) }

    it { is_expected.not_to permit(:approve) }
    it { is_expected.not_to permit(:reject) }
  end

  context 'for an admin who is not a super admin' do
    let(:owner) { create(:admin) }
    let(:user) { owner }

    it { is_expected.not_to permit(:approve) }
    it { is_expected.not_to permit(:reject) }
  end

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:approve) }
    it { is_expected.not_to permit(:reject) }
  end
end
