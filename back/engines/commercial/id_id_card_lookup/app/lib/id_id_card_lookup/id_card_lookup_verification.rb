# frozen_string_literal: true

module IdIdCardLookup
  # Verifies a user by matching their entered ID card id against an uploaded list
  class IdCardLookupVerification < IdMethod::Base
    include IdMethod::VerificationMethod

    def verification_method_type
      :manual_sync
    end

    def id
      '516e134d-e22b-4386-a783-0db4c2708256'
    end

    def name
      'id_card_lookup'
    end

    def config_parameters
      %i[
        ui_method_name
        card_id
        card_id_tooltip
        card_id_placeholder
        explainer_image_url
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          private: true
        },
        card_id: {
          type: 'string',
          private: true
        },
        card_id_tooltip: {
          type: 'string',
          private: true
        }
      }
    end

    def exposed_config_parameters
      %i[
        ui_method_name
        card_id
        card_id_tooltip
        card_id_placeholder
        explainer_image_url
      ]
    end

    def verification_parameters
      [:card_id]
    end

    def verify_sync(card_id: nil)
      raise Verification::VerificationService::ParameterInvalidError, 'card_id' if card_id.blank?
      raise Verification::VerificationService::NoMatchError unless IdCard.find_by_card_id(card_id)

      {
        uid: IdCardService.new.normalize(card_id)
      }
    end
  end
end
