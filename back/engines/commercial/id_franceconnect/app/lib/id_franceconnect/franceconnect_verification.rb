module IdFranceconnect
  module FranceconnectVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      "68fecc38-9449-4087-9475-fc31e05a0936"
    end

    def name
      "franceconnect"
    end

    def config_parameters
      []
    end

    def locked_attributes
      []
    end

    def locked_custom_fields
      []
    end
  end
end
