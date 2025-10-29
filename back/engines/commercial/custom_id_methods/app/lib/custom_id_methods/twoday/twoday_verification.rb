# frozen_string_literal: true

module CustomIdMethods
  module Twoday::TwodayVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      '535bc0d4-cc3a-44e8-a339-2595ec330759'
    end

    def name
      'twoday'
    end

    def config_parameters_schema
      default_config_schema('BankID eller Freja eID+').merge!(SCHEMA_DOMAIN)
    end

    def exposed_config_parameters
      [
        :ui_method_name
      ]
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def other_attributes
      %i[email]
    end

    def profile_to_uid(auth)
      auth['uid']
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end

    def ui_method_name
      config[:ui_method_name] || name
    end
  end
end
