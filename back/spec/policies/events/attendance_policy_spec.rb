# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Events::AttendancePolicy do
  subject { described_class.new(user, attendance) }

  let(:attendance) { create(:event_attendance, attendee: attendee) }
  let(:scope) { described_class::Scope.new(user, Events::Attendance) }

  context 'when the user has admin rights' do
    let_it_be(:user) { create(:admin) }

    context 'when attendee is an other user' do
      let_it_be(:attendee) { create(:user) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:destroy) }
    end

    context 'when attendee is the current user' do
      let_it_be(:attendee) { user }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:destroy) }
    end

    specify do
      create_list(:event_attendance, 2)
      expect(scope.resolve.count).to eq(2)
    end
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }
    let_it_be(:attendee) { create(:user) }

    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }

    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end

  context 'when user is a regular user' do
    let(:user) { create(:user) }

    context 'when attendee is an other user' do
      let(:attendee) { create(:user) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'when attendee is the current user' do
      let(:attendee) { user }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:destroy) }
    end

    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end
end
