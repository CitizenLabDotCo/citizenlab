# frozen_string_literal: true

module ProjectGeneration
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'ai_project_generator'
    end

    def self.feature_title
      'AI project generator'
    end

    def self.feature_description
      'Lets managers draft a whole project (phases, page content, survey) from a prompt and/or a document with AI.'
    end

    def self.allowed_by_default
      true
    end

    def self.enabled_by_default
      true
    end
  end
end
