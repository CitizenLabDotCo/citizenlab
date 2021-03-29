# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module GranularPermissions
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'granular_permissions'
    end

    def self.feature_title
      'Granular Permissions'
    end

    def self.feature_description
      'Admin can specify permissions for specific projects and project phases (e.g., who can post, vote, etc.).'
    end
  end
end
