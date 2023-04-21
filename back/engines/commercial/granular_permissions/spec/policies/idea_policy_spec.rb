# frozen_string_literal: true

require 'rails_helper'

describe IdeaPolicy do
  subject(:policy) { described_class.new(user, @idea) }

  before do
    IdeaStatus.create_defaults
    @idea = create(:idea, project: project, author: author)
  end

  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }
  let(:author) { create(:user) }
  let(:permitted_by) { 'admins_moderators' }
  let(:participation_method) { 'ideation' }
  let(:posting_enabled) { true }
  let(:project) do
    create(:continuous_project, with_permissions: true, posting_enabled: posting_enabled, participation_method: participation_method).tap do |project|
      project.permissions.find_by(action: 'posting_idea')
        .update!(permitted_by: permitted_by)
    end
  end

  context "for a visitor with posting permissions granted to 'everyone'" do
    let(:user) { nil }
    let(:permitted_by) { 'everyone' }

    describe 'in a participation method where everyone can post' do
      let(:participation_method) { 'native_survey' }

      it { is_expected.not_to permit(:show) }
      it { is_expected.to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end

    describe 'in a participation method where sign-in is required to post' do
      let(:participation_method) { 'ideation' }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'for the author of an idea in a project where posting is not permitted' do
    let(:user) { author }
    let(:posting_enabled) { false }

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.to permit(:update) }
    it { is_expected.to permit(:destroy) }

    it 'indexes the idea' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
