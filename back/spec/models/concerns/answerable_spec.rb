# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Answerable do
  describe '#answer_for_key' do
    let_it_be(:user) { create(:user) }

    before_all do
      create(:custom_field_answer, answerable: user, key: 'pet', value: 'other')
      create(:custom_field_answer, answerable: user, key: 'pet_other', value: 'A ferret')
    end

    it 'returns the answer stored under the key' do
      expect(user.answer_for_key('pet').value).to eq 'other'
      expect(user.answer_for_key('pet_other').value).to eq 'A ferret'
    end

    it 'returns nil when there is no answer under the key' do
      expect(user.answer_for_key('unanswered')).to be_nil
    end

    it 'does not query when the answers are preloaded' do
      preloaded = User.includes(:custom_field_answers).find(user.id)

      expect { preloaded.answer_for_key('pet') }.not_to exceed_query_limit(0)
    end
  end
end
