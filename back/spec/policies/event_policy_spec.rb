# frozen_string_literal: true

require 'rails_helper'

describe EventPolicy do
  subject { described_class.new(user, event) }

  let(:scope) { EventPolicy::Scope.new(user, project.events, attendee_id) }
  let(:attendee_id) { nil }

  context 'on event in a public project' do
    let(:project) { create(:continuous_project) }
    let!(:event) { create(:event, project: project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the event' do
        expect(scope.resolve.size).to eq 1
      end

      context 'when filtering by attendee' do
        let(:attendee_id) { 'whatever-id' }

        it 'raises an Unauthorized error' do
          expect { scope.resolve }.to raise_error(Pundit::NotAuthorizedError)
        end
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the event' do
        expect(scope.resolve.size).to eq 1
      end

      context 'when filtering by attendee' do
        context 'when user is not the attendee' do
          let(:attendance) { create(:event_attendance, event: event) }
          let(:attendee_id) { attendance.attendee_id }

          it 'raises an Unauthorized error' do
            expect { scope.resolve }.to raise_error(Pundit::NotAuthorizedError)
          end
        end

        context 'when user is the attendee' do
          let(:attendance) { create(:event_attendance, event: event, attendee: user) }
          let(:attendee_id) { attendance.attendee_id }

          it 'indexes the event' do
            expect(scope.resolve.size).to eq 1
          end
        end
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }

      it 'indexes the event' do
        expect(scope.resolve.size).to eq 1
      end

      context 'when filtering by attendee' do
        let(:attendance) { create(:event_attendance, event: event) }
        let(:attendee_id) { attendance.attendee_id }

        it 'indexes the event' do
          expect(scope.resolve.size).to eq 1
        end
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }

      it 'indexes the event' do
        expect(scope.resolve.size).to eq 1
      end

      context 'when filtering by attendee' do
        let(:attendance) { create(:event_attendance, event: event) }
        let(:attendee_id) { attendance.attendee_id }

        it 'indexes the event' do
          expect(scope.resolve.size).to eq 1
        end
      end
    end

    context 'for a moderator of another project' do
      let(:user) { create(:project_moderator) }

      it 'indexes the event' do
        expect(scope.resolve.size).to eq 1
      end

      context 'when filtering by attendee' do
        let(:attendance) { create(:event_attendance, event: event) }
        let(:attendee_id) { attendance.attendee_id }

        it 'does not index the event' do
          expect(scope.resolve.size).to eq 0
        end
      end
    end
  end

  context 'for a visitor on an event in a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }
    let!(:event) { create(:event, project: project) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the event' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an event in a private groups project where she's no member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }
    let!(:event) { create(:event, project: project) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the event' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an event in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user) }
    let!(:event) { create(:event, project: project) }

    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the event' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
