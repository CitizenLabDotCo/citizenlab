# frozen_string_literal: true

require 'rails_helper'

describe IdeaReactionPolicy do
  subject(:policy) { described_class.new(user, reaction) }

  let(:scope) { IdeaReactionPolicy::Scope.new(user, Reaction) }
  let(:project) { create(:continuous_project) }
  let(:reactable) { create(:idea, project: project) }
  let!(:reaction) { create(:reaction, reactable: reactable) }

  context 'for a mortal user who owns the reaction on an idea in a project where reacting is not permitted' do
    let!(:user) { create(:user) }
    let!(:idea) { create(:idea, project: project) }
    let!(:reaction) { create(:reaction, reactable: idea, user: user) }
    let!(:project) do
      create(:continuous_project, with_permissions: true).tap do |project|
        project.permissions.find_by(action: 'reacting_idea')
          .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.to permit(:show) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.up? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.down? }.to raise_error(Pundit::NotAuthorizedError) }
    it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

    it 'indexes the reaction' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
