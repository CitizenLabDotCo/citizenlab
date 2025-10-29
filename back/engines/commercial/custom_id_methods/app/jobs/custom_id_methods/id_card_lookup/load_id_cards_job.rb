# frozen_string_literal: true

module CustomIdMethods
  class IdCardLookup::LoadIdCardsJob < ApplicationJob
    queue_as :default

    def run(card_ids)
      card_ids.each do |card_id|
        IdCardLookup::IdCard.create(card_id: card_id) if card_id.present?
      end
    end
  end
end
