# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module Clusterings
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'clustering'
    end

    def self.feature_title
      'Clusterings Configuration'
    end

    def self.feature_description
      'Adds an extra method to classify inputs with nlp.'
    end
  end
end
