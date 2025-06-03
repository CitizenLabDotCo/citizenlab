# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RelatedIdea do
  subject(:related_idea) { create(:related_idea) }

  it { is_expected.to be_valid }

  describe 'associations' do
    it { is_expected.to belong_to(:idea) }
    it { is_expected.to belong_to(:related_idea).class_name('Idea') }
  end

  describe 'validations' do
    let_it_be(:idea1) { create(:idea) }
    let_it_be(:idea2) { create(:idea) }

    it { is_expected.to validate_presence_of(:idea) }
    it { is_expected.to validate_presence_of(:related_idea) }

    it 'validates uniqueness of related_idea_id scoped to idea_id' do
      create(:related_idea, idea: idea1, related_idea: idea2)
      expect(build(:related_idea, idea: idea1, related_idea: idea2)).not_to be_valid
    end

    it 'prevents an idea from being related to itself' do
      related_idea = build(:related_idea, idea: idea1, related_idea: idea1)
      expect(related_idea).not_to be_valid
      expect(related_idea.errors[:related_idea]).to include('An idea cannot be related to itself')
    end
  end
end
