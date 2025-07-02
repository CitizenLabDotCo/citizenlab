# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdRmUnify
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'rm_unify_login'
    end

    def self.feature_title
      'RM Unify (Glow Connect) Login'
    end

    def self.feature_description
      'Allow users to authenticate and verify with a Scottish schools Glow Connect (RmUnify) account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
