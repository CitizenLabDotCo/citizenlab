require 'rails_helper'

RSpec.describe Verification::IdCard, type: :model do
  describe "IdCard default factory" do
    it "is valid" do
      expect(build(:verification_id_card)).to be_valid
    end
  end

  describe "Assigning a card_id" do
    it "stores the hashed, normalized version" do
      id_card = build(:verification_id_card, hashed_card_id: nil)
      id_card.card_id = "abC-123"
      expect(id_card.hashed_card_id).to eq '$2a$10$Cu8AnxXnDwWAH0OkCBrbd.HRygNJciP8GOrAHiSytzKDCWDWyaiq2'
    end
  end

end
