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

  context 'for a mortal user on response of another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a mortal user who owns the response' do
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

  context "for a mortal user who owns the response in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, participation_method: 'poll') }
    let!(:response) { create(:poll_response, participation_context: project, user: user) }

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end
end
