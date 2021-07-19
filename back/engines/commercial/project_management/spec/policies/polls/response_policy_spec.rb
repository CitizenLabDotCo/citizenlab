# frozen_string_literal: true

require 'rails_helper'

skip_reason = defined?(Polls::Engine) ? nil : "polls engine is not installed"

describe 'Polls::ResponsePolicy', skip: skip_reason do
  subject { Polls::ResponsePolicy.new(user, response) }

  let(:scope) { Polls::ResponsePolicy::Scope.new(user, Polls::Response) }
  let(:pc) { create(:continuous_poll_project) }
  let!(:response) { build(:poll_response, participation_context: pc) }

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
end
