module IdIdCardLookup
  # Verifies a user by matching their entered ID card id against an uploaded list
  class IdCardLookupVerification
    include Verification::VerificationMethod

    def verification_method_type
      :manual_sync
    end

    def id
      "516e134d-e22b-4386-a783-0db4c2708256"
    end

    def name
      "id_card_lookup"
    end

    def config_parameters
      [
        :method_name_multiloc,
        :card_id_multiloc,
        :card_id_tooltip_multiloc,
        :card_id_placeholder,
        :explainer_image_url,
      ]
    end

    def config_parameters_schema
      {
        method_name_multiloc: {
          "$ref": "#/definitions/multiloc_string",
          private: true
        },
        card_id_multiloc: {
          "$ref": "#/definitions/multiloc_string",
          private: true
        },
        card_id_tooltip_multiloc: {
          "$ref": "#/definitions/multiloc_string",
          private: true
        },
      }
    end

    def exposed_config_parameters
      [
        :method_name_multiloc,
        :card_id_multiloc,
        :card_id_tooltip_multiloc,
        :card_id_placeholder,
        :explainer_image_url,
      ]
    end

    def verification_parameters
      [:card_id]
    end

    def verify_sync card_id: nil
      if card_id.blank?
        raise Verification::VerificationService::ParameterInvalidError.new('card_id')
      elsif IdCard.find_by_card_id(card_id)
        {
          uid: IdCardService.new.normalize(card_id)
        }
      else
        raise Verification::VerificationService::NoMatchError.new
      end
    end
  end
end
