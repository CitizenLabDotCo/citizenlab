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

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'environment', required: true, schema: {
      type: 'string',
      title: 'Environment',
      description: 'Live on the production FranceConnect environment or still testing on their integration environment?',
      enum: %w[production integration],
      default: 'production',
      private: true
    }

    add_setting 'identifier', required: true, schema: {
      title: 'Identifier',
      type: 'string',
      private: true
    }

    add_setting 'secret', required: true, schema: {
      title: 'Secret Key',
      type: 'string',
      private: true
    }

    add_setting 'scope', required: true, schema: {
      title: 'Scope',
      description: 'The data that will be requested from FranceConnect. See https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#identite-pivot. Fields that can be saved: email, given_name, family_name, birthdate, gender.',
      type: 'array',
      items: {
        type: 'string',
        enum: %w[email given_name family_name birthdate gender idp_birthdate birthplace birthcountry preferred_username profile birth identite_pivot]
      },
      uniqueItems: true,
      default: %w[email given_name family_name],
      private: true
    }
  end
end
