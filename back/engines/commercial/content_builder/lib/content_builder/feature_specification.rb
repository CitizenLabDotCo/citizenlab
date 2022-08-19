# frozen_string_literal: true

module ContentBuilder
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'content_builder'
    end

    def self.feature_title
      'Content builder'
    end

    def self.feature_description
      'Customize the layouts for different parts of the platform (project page, home page etc.). This feature is experimental and should not be enabled yet.'
    end
  end
end
