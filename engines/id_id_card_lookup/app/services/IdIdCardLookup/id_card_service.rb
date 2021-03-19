module IdIdCardLookup
  class IdCardService

    def encode card_id
      hash(normalize(card_id))
    end

    def normalize card_id
      card_id.gsub(/[^0-9a-z]/i,"").downcase
    end

    private

    def hash card_id
      # salt should be generated with BCrypt::Engine.generate_salt
      BCrypt::Engine.hash_secret card_id, ENV.fetch('VERIFICATION_ID_CARD_SALT')
    end
  end
end
