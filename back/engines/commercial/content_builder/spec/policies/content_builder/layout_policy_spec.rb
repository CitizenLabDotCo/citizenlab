# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::LayoutPolicy do
  subject(:policy) { described_class.new(user, layout) }

  let(:layout) { create(:layout) }
  let(:user_role_service) { policy.send(:user_role_service) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:upsert) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for an inactive user' do
    let(:user) { instance_double User, active?: false }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:upsert) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for an active user' do
    let(:user) { instance_double User, active?: true }

    before do
      allow(user_role_service).to receive(
        :can_moderate?
      ).with(
        layout.content_buildable,
        user
      ).and_return can_moderate
    end

    context 'for non-moderators' do
      let(:can_moderate) { false }

      it { is_expected.to permit(:show) }

      it 'forbids upsert' do
        expect(user_role_service).to receive(:can_moderate?)
        expect(policy).not_to permit(:upsert)
      end

      it 'forbids destroy' do
        expect(user_role_service).to receive(:can_moderate?)
        expect(policy).not_to permit(:destroy)
      end
    end

    context 'for moderators' do
      let(:can_moderate) { true }

      it { is_expected.to permit(:show) }

      it 'permits upsert' do
        expect(user_role_service).to receive(:can_moderate?)
        expect(policy).to permit(:upsert)
      end

      it 'permits destroy' do
        expect(user_role_service).to receive(:can_moderate?)
        expect(policy).to permit(:destroy)
      end
    end
  end
end
