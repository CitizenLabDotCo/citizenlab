require 'rails_helper'

RSpec.describe ParticipationMethod::Base do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:phase) }

  describe '#participant_id' do
    it 'returns the user_id when present' do
      expect(participation_method.participant_id('item_id', 'user_id', 'user_hash')).to eq('user_id')
    end

    it 'returns user_hash when user_id is not present' do
      expect(participation_method.participant_id('item_id', nil, 'user_hash')).to eq('user_hash')
    end

    it 'returns item ID when neither user_id nor user_hash is present' do
      expect(participation_method.participant_id('item_id', nil, nil)).to eq('item_id')
    end
  end
end
