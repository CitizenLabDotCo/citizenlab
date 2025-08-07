# frozen_string_literal: true

module IdRmUnify
  module RmUnifyVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      'b451ce57-1ee5-4fbd-9b95-0730f79d1cf2'
    end

    def name
      'rm_unify'
    end

    def config_parameters
      %i[enabled_for_verified_actions]
    end

    def config_parameters_schema
      {}
    end

    def ui_method_name
      'RM Unify'
    end
  end
end
