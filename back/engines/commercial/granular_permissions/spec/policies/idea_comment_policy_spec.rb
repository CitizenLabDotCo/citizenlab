# frozen_string_literal: true

require 'rails_helper'

describe IdeaCommentPolicy do
  subject { described_class.new(user, comment) }

  let(:scope) { IdeaCommentPolicy::Scope.new(user, idea.comments) }

  context 'for a mortal user who owns the comment in a project where commenting is not permitted' do
    let!(:user) { create(:user) }
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea, author: user) }
    let!(:project) do
      create(:continuous_budgeting_project).tap do |project|
        project.permissions.find_by(action: 'commenting_idea')
               .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.to     permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the comment' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
