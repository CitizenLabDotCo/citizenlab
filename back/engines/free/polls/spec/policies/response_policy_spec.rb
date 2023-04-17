# frozen_string_literal: true

require 'rails_helper'

describe Polls::ResponsePolicy do
  subject { described_class.new(user, response) }

  let(:scope) { Polls::ResponsePolicy::Scope.new(user, Polls::Response) }
  let(:pc) { create(:continuous_poll_project) }
  let!(:response) { build(:poll_response, participation_context: pc) }

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
    let!(:project) { create(:private_groups_project, participation_method: 'poll') }
    let!(:response) { create(:poll_response, participation_context: project, user: user) }

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a moderator of the response's project that doesn't own the response" do
    let(:user) { create(:project_moderator, projects: [pc]) }

    it { is_expected.not_to permit(:create) }

    it 'indexes the response' do
      response.save!
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a moderator of another project that owns the response' do
    let(:user) { create(:project_moderator) }
    let!(:response) { build(:poll_response, user: user, participation_context: pc) }

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
end
