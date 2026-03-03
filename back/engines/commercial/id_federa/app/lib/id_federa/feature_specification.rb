# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdFedera
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'federa_login'
    end

    def self.feature_title
      'FedERa/SPID Single sign-on - DO NOT USE'
    end

    def self.feature_description
      'DO NOT USE YET!! Allow citizens to authenticate via FedERa (SPID/CIE/CNS) Italian SSO.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
