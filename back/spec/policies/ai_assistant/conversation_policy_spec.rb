# frozen_string_literal: true

require 'rails_helper'

describe AIAssistant::ConversationPolicy do
  subject(:policy) { described_class.new(user, conversation) }

  let(:conversation) { build(:ai_assistant_conversation, user: owner) }
  let(:owner) { create(:super_admin) }

  context 'for the super admin who owns the conversation' do
    let(:user) { owner }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }

    it 'includes the conversation in the scope' do
      conversation.save!
      expect(described_class::Scope.new(user, AIAssistant::Conversation).resolve).to eq([conversation])
    end
  end

  context 'for another super admin' do
    let(:user) { create(:super_admin) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
  end

  context 'for an admin who is not a super admin' do
    let(:owner) { create(:admin) }
    let(:user) { owner }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }

    it 'scopes out all conversations' do
      conversation.save!
      expect(described_class::Scope.new(user, AIAssistant::Conversation).resolve).to be_empty
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
  end
end
