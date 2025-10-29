# frozen_string_literal: true

module CustomIdMethods
  module IdAustria::IdAustriaVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      '91068f8a-c4a5-4fc8-ab3e-ca2eb74f9c3c'
    end

    def name
      'id_austria'
    end

    def ui_method_name
      config[:ui_method_name].presence || name
    end

    def config_parameters_schema
      default_config_schema('ID Austria')
    end

    def entitled?(_auth)
      true
    end

    def exposed_config_parameters
      [:ui_method_name]
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
