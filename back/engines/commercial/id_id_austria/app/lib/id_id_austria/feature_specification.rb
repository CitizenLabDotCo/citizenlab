# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdIdAustria
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'id_austria_login'
    end

    def self.feature_title
      'ID Austria Login'
    end

    def self.feature_description
      'Allow users to authenticate with a ID Austria account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
