# frozen_string_literal: true

require 'rails_helper'

describe Volunteering::VolunteerPolicy do
  subject { described_class.new(user, volunteer) }

  let(:scope) { described_class::Scope.new(user, cause.volunteers) }

  context 'on volunteer in a public project' do
    let(:project) { create(:single_phase_volunteering_project) }
    let(:cause) { create(:cause, phase: project.phases.first) }
    let!(:volunteer) { create(:volunteer, cause: cause) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the volunteer' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the volunteer' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the volunteer' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a project moderator' do
      let(:user) { create(:user, roles: [{ type: 'project_moderator', project_id: project.id }]) }

      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the volunteer' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for the volunteer' do
      let(:user) { volunteer.user }

      it { is_expected.to permit(:create) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the volunteer' do
        expect(scope.resolve.size).to eq 0
      end
    end
  end
end
