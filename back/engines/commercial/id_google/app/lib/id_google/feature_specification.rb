# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdGoogle
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'google_login'
    end

    def self.feature_title
      'Google Login'
    end

    def self.feature_description
      'Allow users to register and sign in through their Google account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'client_id', schema: {
      title: 'Client ID',
      type: 'string',
      private: true
    }

    add_setting 'client_secret', schema: {
      title: 'Client Secret',
      type: 'string',
      private: true
    }
  end
end
