# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdeaAssigment
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'idea_assignment'
    end

    def self.feature_title
      'Assign Ideas'
    end

    def self.feature_description
      'Ideas can be assigned to specific admin and project managers to respond to.'
    end
  end
end
# "idea_assignment": {
#   "type": "object",
#   "title": "Assign Ideas",
#   "description": "Ideas can be assigned to specific admin and project managers to respond to.",
#   "additionalProperties": false,
#   "required": ["allowed", "enabled"],
#   "properties": {
#     "allowed": { "type": "boolean", "default": true},
#     "enabled": { "type": "boolean", "default": true}
#   }
# },
