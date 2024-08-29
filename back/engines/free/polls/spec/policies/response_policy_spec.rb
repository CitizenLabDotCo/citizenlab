# frozen_string_literal: true

require 'rails_helper'

describe Polls::ResponsePolicy do
  subject { described_class.new(user, response) }

  let(:scope) { Polls::ResponsePolicy::Scope.new(user, Polls::Response) }
  let(:phase) { create(:poll_phase) }
  let!(:response) { build(:poll_response, phase: phase) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a resident on response of another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a resident who owns the response' do
    let(:user) { response.user }

    it { is_expected.to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for an admin that doesn't own the response" do
    let(:user) { create(:admin) }

    it { is_expected.not_to permit(:create) }

    it 'indexes the response' do
      response.save!
      expect(scope.resolve.size).to eq 1
    end
  end

  context "for a resident who owns the response in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, phase_attrs: { participation_method: 'poll' }) }
    let!(:response) { create(:poll_response, phase: project.phases.first, user: user) }

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a moderator of the response's project that doesn't own the response" do
    let(:user) { create(:project_moderator, projects: [phase.project]) }

    it { is_expected.not_to permit(:create) }

    it 'indexes the response' do
      response.save!
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a moderator of another project that owns the response' do
    let(:user) { create(:project_moderator) }
    let!(:response) { build(:poll_response, user: user, phase: phase) }

    it { is_expected.to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for blocked user' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }

    it_behaves_like 'policy for blocked user', show: false
  end

  context 'for a resident who owns the response in a project where taking a poll is not permitted' do
    let!(:user) { create(:user) }
    let!(:response) { create(:poll_response, phase: phase, user: user) }
    let!(:phase) do
      create(:poll_phase, with_permissions: true).tap do |phase|
        phase.permissions.find_by(action: 'taking_poll').update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end
end
