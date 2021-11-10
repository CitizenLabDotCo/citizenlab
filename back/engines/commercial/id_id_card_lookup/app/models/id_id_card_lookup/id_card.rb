# == Schema Information
#
# Table name: id_id_card_lookup_id_cards
#
#  id             :uuid             not null, primary key
#  hashed_card_id :string
#
# Indexes
#
#  index_id_id_card_lookup_id_cards_on_hashed_card_id  (hashed_card_id)
#
module IdIdCardLookup
  class IdCard < ApplicationRecord

    validates :hashed_card_id, presence: true, uniqueness: true

    def self.find_by_card_id card_id
      find_by(hashed_card_id: IdCardService.new.encode(card_id))
    end

    def card_id= card_id
      self.hashed_card_id = IdCardService.new.encode(card_id)
    end

  end
end
