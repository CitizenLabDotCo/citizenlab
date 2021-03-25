# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module ProjectFolders
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'project_folders'
    end

    def self.feature_title
      'Project Folders'
    end

    def self.feature_description
      'Allow project folders.'
    end
  end
end
