# frozen_string_literal: true

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
module CustomIdMethods
  class IdCardLookup::IdCard < ApplicationRecord
    self.table_name = 'id_id_card_lookup_id_cards' # Moved from an old engine

    validates :hashed_card_id, presence: true, uniqueness: true

    def self.find_by_card_id(card_id)
      find_by(hashed_card_id: IdCardLookup::IdCardService.new.encode(card_id))
    end

    def card_id=(card_id)
      self.hashed_card_id = IdCardLookup::IdCardService.new.encode(card_id)
    end
  end
end
