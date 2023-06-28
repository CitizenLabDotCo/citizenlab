# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::SingleVoting do
  subject(:voting_method) { described_class.new project }

  let(:project) { create(:continuous_single_voting_project) }

  describe '#initialize' do
    it 'sets a default voting term of "vote"' do
      expect(project.voting_term_singular_multiloc['en']).to eq 'vote'
      expect(project.voting_term_plural_multiloc['en']).to eq 'votes'
    end

    it 'sets max_votes_per_idea to 1' do
      expect(project.voting_max_votes_per_idea).to eq 1
    end
  end

  describe '#validate' do
    it 'sets no errors when voting_max_total is present' do
      project.voting_max_total = 10
      voting_method.validate
      expect(project.errors.details).to be_blank
    end

    it 'sets errors when voting_max_total is blank' do
      project.voting_max_total = nil
      voting_method.validate
      expect(project.errors.details).to eq(
        voting_max_total: [error: :blank]
      )
    end

    it 'sets an error when voting term singular is set and voting term plural is not' do
      project.voting_term_plural_multiloc = nil
      voting_method.validate
      expect(project.errors.details).to eq(
        voting_term_plural_multiloc: [error: :blank]
      )
    end

    it 'sets an error when voting term plural is set and voting term singular is not' do
      project.voting_term_singular_multiloc = nil
      voting_method.validate
      expect(project.errors.details).to eq(
        voting_term_singular_multiloc: [error: :blank]
      )
    end

    it 'sets voting max votes per idea to 1 if set to any other value' do
      project.voting_max_votes_per_idea = 2
      voting_method.validate
      expect(project.voting_max_votes_per_idea).to eq 1
    end
  end
end
