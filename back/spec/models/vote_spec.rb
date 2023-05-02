# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vote do
  context 'associations' do
    it { is_expected.to belong_to(:user).optional }
    it { is_expected.to belong_to(:votable) }
  end

  context 'Default factory' do
    it 'is valid' do
      expect(build(:vote)).to be_valid
    end
  end

  context 'uniquness' do
    it "can't create 2 votes for the same votable and user" do
      idea = create(:idea)
      user = create(:user)
      create(:vote, votable: idea, user: user)
      expect(build(:vote, mode: 'up', votable: idea, user: user)).not_to be_valid
      # Must be valid to be able to turn upvote into downvote in transaction
      expect(build(:vote, mode: 'down', votable: idea, user: user)).to be_valid
      expect { create(:vote, mode: 'down', votable: idea, user: user) }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it 'two votes of deleted users are allowed' do
      idea = create(:idea)
      u1 = create(:user)
      v1 = create(:vote, votable: idea, user: u1)
      u2 = create(:user)
      v2 = create(:vote, votable: idea, user: u2)
      u1.destroy!
      u2.destroy!
      expect(v1.reload).to be_valid
      expect(v2.reload).to be_valid
    end
  end
end
