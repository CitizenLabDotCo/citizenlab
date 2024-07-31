# frozen_string_literal: true

module IdFakeSso
  module FakeSsoVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      '8bb00a8d-26a5-4e00-866d-36e23986d441'
    end

    def name
      'fake_sso'
    end

    def config_parameters
      []
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end
  end
end
