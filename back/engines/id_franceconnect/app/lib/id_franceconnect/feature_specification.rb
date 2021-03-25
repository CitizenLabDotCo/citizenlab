# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdFranceconnect
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'franceconnect_login'
    end

    def self.feature_title
      'FranceConnect Login'
    end

    def self.feature_description
      'Allow users to authenticate and verify with a FranceConnect account.'
    end

    add_setting 'environment', required: true, schema: {
      type: "string",
      title: "Environment",
      description: "Live on the production FranceConnect environment or still testing on their integration environment?",
      enum: ["production", "integration"],
      default: "production",
      private: true
    }

    add_setting 'identifier', required: true, schema: {
      title: "Identifier",
      type: "string",
      private: true
    }

    add_setting 'secret', required: true, schema: {
      title: "Secret Key",
      type: "string",
      private: true
    }

  end
end
