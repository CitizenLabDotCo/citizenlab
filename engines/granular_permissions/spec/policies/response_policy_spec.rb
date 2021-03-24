# frozen_string_literal: true

require 'rails_helper'

describe Polls::ResponsePolicy do
  subject { described_class.new(user, response) }

  let(:scope) { Polls::ResponsePolicy::Scope.new(user, Polls::Response) }
  let(:pc) { create(:continuous_poll_project) }
  let!(:response) { build(:poll_response, participation_context: pc) }

  context 'for a mortal user who owns the response in a project where taking a poll is not permitted' do
    let!(:user) { create(:user) }
    let!(:response) { create(:poll_response, participation_context: project, user: user) }
    let!(:project) do
      create(:continuous_poll_project).tap do |project|
        project.permissions.find_by(action: 'taking_poll')
               .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.not_to permit(:create) }

    it 'does not index the response' do
      response.save!
      expect(scope.resolve.size).to eq 0
    end
  end
end
