# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::SingleVoting do
  subject(:voting_method) { described_class.new project }

  let(:project) { create(:continuous_single_voting_project) }

  describe '#initialize' do
    it 'has max_votes_per_idea to 1' do
      expect(project.voting_max_votes_per_idea).to eq 1
    end
  end

  describe '#validate' do
    it 'sets no errors when initialised' do
      voting_method.validate
      expect(project.errors.details).to be_blank
    end

    it 'sets an error when voting_max_votes_per_idea is not 1' do
      project.voting_max_votes_per_idea = 2
      voting_method.validate
      expect(project.errors.details).to eq(
        voting_max_votes_per_idea: [error: :invalid]
      )
    end
  end
end
