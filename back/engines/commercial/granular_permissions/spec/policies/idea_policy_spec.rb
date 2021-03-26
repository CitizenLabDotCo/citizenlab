# frozen_string_literal: true

require 'rails_helper'

describe IdeaPolicy do
  subject(:policy) { described_class.new(user, idea) }

  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }

  context 'for a mortal user who owns the idea in a project where posting is not permitted' do
    let!(:user) { create(:user) }
    let!(:idea) { create(:idea, author: user, project: project) }
    let!(:project) do
      create(:continuous_project, posting_enabled: false).tap do |project|
        project.permissions.find_by(action: 'posting_idea')
               .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.to permit(:update) }
    it { is_expected.to permit(:destroy) }

    it 'indexes the idea' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
