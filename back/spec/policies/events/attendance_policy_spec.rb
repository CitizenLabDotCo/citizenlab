# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Events::AttendancePolicy do
  subject { described_class.new(user, attendance) }

  let(:attendance) { create(:event_attendance, attendee: attendee) }
  let(:scope) { described_class::Scope.new(user, Events::Attendance) }

  context 'when the user is an admin' do
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

    it 'scopes are not filtered' do
      create_list(:event_attendance, 2)
      expect(scope.resolve.count).to eq(2)
    end
  end

  context 'when the user is a moderator' do
    let(:event) { create(:event) }
    let(:user) { build(:project_moderator, project_ids: [event.project_id]) }
    let(:attendance) { create(:event_attendance, event: event, attendee: attendee) }

    context 'when attendee is an other user' do
      let(:attendee) { create(:user) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.to permit(:destroy) }
    end

    context 'when attendee is the current user' do
      let(:attendee) { user }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:destroy) }
    end

    it 'scopes are filtered' do
      attendance = create(:event_attendance, event: event)
      create_list(:event_attendance, 2)
      # Only the attendance for the project the moderator moderates is returned
      expect(scope.resolve.to_a).to eq [attendance]
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

      context 'and is allowed to view the project the event belongs to' do
        it { is_expected.to permit(:create) }
      end

      context 'and is not allowed to view the project the event belongs to' do
        before do
          attendance.event.project.update!(visible_to: :admins)
        end

        it { is_expected.not_to permit(:create) }
      end

      it { is_expected.to permit(:destroy) }
    end

    it "scopes only include the user's own attendances" do
      create_list(:event_attendance, 2)
      create(:event_attendance, attendee: user)
      expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError)
    end
  end
end
