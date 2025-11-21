require 'rails_helper'

RSpec.describe ParticipationMethod::Base do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:phase) }
  
  describe '#participant_id' do
    context 'when given an idea' do
      let(:idea) { create(:idea) }

      it 'returns the author_id when present' do
        expect(participation_method.participant_id(idea)).to eq(idea.author_id)
      end

      it 'returns author_hash when author_id is not present' do
        idea.update!(author_id: nil)
        expect(participation_method.participant_id(idea)).to eq(idea.author_hash)
      end

      it 'returns item ID when neither author_id nor author_hash is present' do
        idea.update!(author_id: nil, author_hash: nil)
        expect(participation_method.participant_id(idea)).to eq(idea.id)
      end
    end

    context 'when given a comment' do
      let(:comment) { create(:comment) }

      it 'returns the author_id when present' do
        expect(participation_method.participant_id(comment)).to eq(comment.author_id)
      end

      it 'returns author_hash when author_id is not present' do
        comment.update!(author_id: nil)
        expect(participation_method.participant_id(comment)).to eq(comment.author_hash)
      end

      it 'returns item ID when neither author_id nor author_hash is present' do
        comment.update!(author_id: nil, author_hash: nil)
        expect(participation_method.participant_id(comment)).to eq(comment.id)
      end
    end

    context 'when given a reaction' do
      let(:reaction) { create(:reaction) }

      it 'returns the user_id when present' do
        expect(participation_method.participant_id(reaction)).to eq(reaction.user_id)
      end

      it 'returns item ID when user_id not present' do
        reaction.update!(user_id: nil)
        expect(participation_method.participant_id(reaction)).to eq(reaction.id)
      end
    end

    context 'when given a basket' do
      let(:basket) { create(:basket) }

      it 'returns the user_id when present' do
        expect(participation_method.participant_id(basket)).to eq(basket.user_id)
      end

      it 'returns item ID when user_id not present' do
        basket.update!(user_id: nil)
        expect(participation_method.participant_id(basket)).to eq(basket.id)
      end
    end
  end
end
