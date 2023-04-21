# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::LayoutImagePolicy do
  subject(:policy) { described_class.new(user, image) }

  let(:image) { create(:layout_image) }
  let(:user_role_service) { policy.send(:user_role_service) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:create) }
  end

  context 'for an inactive user' do
    let(:user) { instance_double User, active?: false }

    it { is_expected.not_to permit(:create) }
  end

  context 'for an active user' do
    let(:user) { instance_double User, active?: true }

    before do
      allow(user_role_service).to receive(
        :moderates_something?
      ).with(
        user
      ).and_return moderates_something
    end

    context 'for non-moderators' do
      let(:moderates_something) { false }

      it 'forbids create' do
        expect(user_role_service).to receive(:moderates_something?)
        expect(policy).not_to permit(:create)
      end
    end

    context 'for moderators' do
      let(:moderates_something) { true }

      it 'permits create' do
        expect(user_role_service).to receive(:moderates_something?)
        expect(policy).to permit(:create)
      end
    end
  end
end
