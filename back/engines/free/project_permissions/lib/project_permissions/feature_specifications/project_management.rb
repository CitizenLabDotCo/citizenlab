# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module ProjectPermissions
  module FeatureSpecifications
    module ProjectManagement
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'project_management'
      end

      def self.feature_title
        'Project Managers'
      end

      def self.feature_description
        'Enable the project manager role (users who have some administrative rights at a project level).'
      end
    end
  end
end
