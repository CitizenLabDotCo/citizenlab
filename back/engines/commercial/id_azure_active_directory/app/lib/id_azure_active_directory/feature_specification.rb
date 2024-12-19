# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdAzureActiveDirectory
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'azure_active_directory_login'
    end

    def self.feature_title
      'AzureActiveDirectory Login'
    end

    def self.feature_description
      'Allow users to register and sign in through their AzureActiveDirectory account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'app_id', schema: {
      title: 'App ID',
      type: 'string',
      private: true
    }

    add_setting 'app_secret', schema: {
      title: 'App Secret',
      type: 'string',
      private: true
    }
  end
end
