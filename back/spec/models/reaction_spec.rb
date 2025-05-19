# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reaction do
  context 'associations' do
    it { is_expected.to belong_to(:user).optional }
    it { is_expected.to belong_to(:reactable) }
  end

  context 'Default factory' do
    it 'is valid' do
      expect(build(:reaction)).to be_valid
    end
  end

  context 'Neutral Reaction' do
    describe 'Creating a Reaction' do
      it 'is valid for an Idea' do
        idea = create(:idea)
        expect { create(:reaction, mode: 'neutral', reactable: idea) }.to change(Reaction, :count).by(1)
      end

      it 'is invalid for a Comment' do
        comment = create(:comment)
        reaction = build(:reaction, mode: 'neutral', reactable: comment)
        expect(reaction).not_to be_valid
        expect(reaction.errors[:mode]).to include('neutral mode is only valid for ideas')
      end
    end
  end

  context 'uniqueness' do
    it "can't create 2 reactions for the same reactable and user" do
      idea = create(:idea)
      user = create(:user)
      create(:reaction, reactable: idea, user: user)
      expect(build(:reaction, mode: 'up', reactable: idea, user: user)).not_to be_valid
      # Must be valid to be able to turn like into dislike in transaction
      expect(build(:reaction, mode: 'down', reactable: idea, user: user)).to be_valid
      expect { create(:reaction, mode: 'down', reactable: idea, user: user) }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it 'two reactions of deleted users are allowed' do
      idea = create(:idea)
      u1 = create(:user)
      v1 = create(:reaction, reactable: idea, user: u1)
      u2 = create(:user)
      v2 = create(:reaction, reactable: idea, user: u2)
      u1.destroy!
      u2.destroy!
      expect(v1.reload).to be_valid
      expect(v2.reload).to be_valid
    end
  end
end
