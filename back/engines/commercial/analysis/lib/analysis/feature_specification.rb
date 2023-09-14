# frozen_string_literal: true

# Engine namespace
module Analysis
  module FeatureSpecification
    # Note that we are extending (not including) here!
    extend CitizenLab::Mixins::FeatureSpecification

    # will be used as the property key in the main settings json schema
    def self.feature_name
      'analysis'
    end

    def self.feature_title
      'Analysis'
    end

    # optional
    def self.feature_description
      <<~DESC
        Analyze and summarize textual content, assisted by AI
      DESC
    end
  end
end
