# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VotingMethod::Budgeting do
  subject(:voting_method) { described_class.new project }

  let(:project) { create(:continuous_budgeting_project) }

  describe '#validate' do
    let(:project) { build(:continuous_budgeting_project) }

    it 'sets no errors when voting_max_total and voting_min_total are present' do
      project.voting_max_total = 10
      project.voting_min_total = 0
      voting_method.validate
      expect(project.errors.details).to be_blank
    end

    it 'sets errors when voting_max_total and voting_min_total are blank' do
      project.voting_max_total = nil
      project.voting_min_total = nil
      voting_method.validate
      expect(project.errors.details).to eq(
        voting_max_total: [error: :blank],
        voting_min_total: [error: :blank]
      )
    end
  end
end
