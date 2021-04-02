# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module ProjectPermissions
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'project_visibility'
    end

    def self.feature_title
      'Project Visibility'
    end

    def self.feature_description
      'Admin can make projects visible only to certain groups of users (e.g., admin only, smart groups).'
    end
  end
end
