# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdNemlogIn
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'nemlog_in_login'
    end

    def self.feature_title
      'MitID (NemlogIn) Login'
    end

    def self.feature_description
      'Allow users to authenticate and verify with a MitID (via NemlogIn) account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
