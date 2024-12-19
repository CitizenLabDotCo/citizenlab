# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdFacebook
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'facebook_login'
    end

    def self.feature_title
      'Facebook Login'
    end

    def self.feature_description
      'Allow users to register and sign in through their Facebook account.'
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
