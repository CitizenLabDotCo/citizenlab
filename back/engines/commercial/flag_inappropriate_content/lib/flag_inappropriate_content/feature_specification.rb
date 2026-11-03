# frozen_string_literal: true

module FlagInappropriateContent
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'flag_inappropriate_content'
    end

    def self.feature_title
      'Flag Inappropriate Content'
    end

    def self.feature_description
      'Automatically detect inappropriate content posted to the platform using Natural Language Processing.'
    end

    def self.dependencies
      ['moderation']
    end

    add_setting 'custom_guidelines', schema: {
      type: 'string',
      title: 'Additional moderation guidelines',
      description: 'Plain-text participation guidelines specific to this platform. When present, content is also checked against them and violations are flagged with the guideline_violation label.'
    }
  end
end
