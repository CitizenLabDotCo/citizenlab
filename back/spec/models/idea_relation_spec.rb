# frozen_string_literal: true

require 'rails_helper'

RSpec.describe IdeaRelation do
  subject(:idea_relation) { create(:idea_relation) }

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
      create(:idea_relation, idea: idea1, related_idea: idea2)
      expect(build(:idea_relation, idea: idea1, related_idea: idea2)).not_to be_valid
    end

    it 'prevents an idea from being related to itself' do
      idea_relation = build(:idea_relation, idea: idea1, related_idea: idea1)
      expect(idea_relation).not_to be_valid
      expect(idea_relation.errors[:related_idea]).to include('An idea cannot be related to itself')
    end
  end
end
