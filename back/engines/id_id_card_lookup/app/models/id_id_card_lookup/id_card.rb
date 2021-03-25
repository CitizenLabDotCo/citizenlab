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