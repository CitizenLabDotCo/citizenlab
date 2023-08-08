# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdHoplr
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'hoplr_login'
    end

    def self.feature_title
      'Hoplr Login'
    end

    def self.feature_description
      'Allow users to authenticate with a Hoplr account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'client_id', required: true, schema: {
      title: 'Client ID',
      type: 'string',
      private: true
    }

    add_setting 'client_secret', required: true, schema: {
      title: 'Client Secret',
      type: 'string',
      private: true
    }
  end
end
