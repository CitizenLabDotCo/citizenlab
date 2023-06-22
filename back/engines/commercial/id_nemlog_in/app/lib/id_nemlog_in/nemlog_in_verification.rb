# frozen_string_literal: true

module IdNemlogIn
  module NemlogInVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      'e7378672-add2-4eb1-a73b-77a805797eac'
    end

    def name
      'nemlog_in'
    end

    def config_parameters
      %i[]
    end

    def profile_to_uid(auth)
      # auth['uid'] || auth.dig('extra', 'raw_info', 'RolUnico', 'numero')
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end
  end
end
