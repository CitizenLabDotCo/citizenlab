# frozen_string_literal: true

module MachineTranslations
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'machine_translations'
    end

    def self.feature_title
      'Machine Translations'
    end

    def self.feature_description
      'Allows users to see translated content.'
    end

    def self.pricing
      true
    end
  end
end
