# frozen_string_literal: true

# TODO Nasty require; need to find a better way.
require_relative '../../../../lib/citizen_lab/mixins/settings_specification'

module ProjectFolders
  module SettingsSpecification
    extend CitizenLab::Mixins::SettingsSpecification

    def self.settings_name
      'project_folders'
    end

    def self.settings_json_schema
      {
        'type' => 'object',
        'title' => 'Project Folders',
        'description' => 'Allow project folders.',
        'additionalProperties' => false,
        'required' => %w[allowed enabled],
        'properties' => {
          'allowed' => { 'type' => 'boolean', 'default' => true },
          'enabled' => { 'type' => 'boolean', 'default' => true }
        }
      }
    end
  end
end
