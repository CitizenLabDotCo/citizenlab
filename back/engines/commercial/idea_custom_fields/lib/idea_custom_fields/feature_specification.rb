# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdeaCustomFields
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'ai_survey_generator'
    end

    def self.feature_title
      'AI survey generator'
    end

    def self.feature_description
      'Lets admins generate a native survey from a prompt and/or a document with AI.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
