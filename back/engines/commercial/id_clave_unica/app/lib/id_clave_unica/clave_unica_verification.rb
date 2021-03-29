# frozen_string_literal: true

module IdClaveUnica
  module ClaveUnicaVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      "f06ddcf6-38c5-495d-a319-0863a7f3e073"
    end

    def name
      "clave_unica"
    end

    def config_parameters
      [:client_id, :client_secret]
    end

    def profile_to_uid auth
      auth['uid'] || auth.dig('extra','raw_info','RolUnico','numero')
    end

    def locked_attributes
      [:first_name, :last_name]
    end

    def locked_custom_fields
      []
    end

  end
end
