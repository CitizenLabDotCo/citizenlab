# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `participatory_process_user_roles` ──▶ deferred moderator-role assignments.
    #
    # Project-scoped roles live in Go Vocal's JSONB `roles` array, which can't carry a template ref to a
    # not-yet-created project. So this returns plain assignment tuples that {RoleAssigner} applies *after*
    # deserialization, once project ids exist.
    #
    # NOTE: columns are still assumed — the user-roles CSV isn't in the first sample export.
    class ProcessRolesExtractor < BaseExtractor
      COLUMNS = {
        user: 'decidim_user',
        process: 'decidim_participatory_process',
        role: 'role'
      }.freeze

      # Decidim roles that should become a Go Vocal project moderator.
      MODERATOR_ROLES = %w[admin moderator collaborator].freeze

      # @return [Array<Hash>] assignment tuples for RoleAssigner.
      def run
        rows.filter_map do |row|
          user_uid = present_value(row[COLUMNS[:user]])
          process_uid = present_value(row[COLUMNS[:process]])
          role = present_value(row[COLUMNS[:role]])&.downcase
          next if user_uid.nil? || process_uid.nil?
          next unless MODERATOR_ROLES.include?(role)

          {
            user_key: user_uid,
            target_key: process_uid,
            role: 'project_moderator',
            scope_attribute: 'project_id'
          }
        end
      end
    end
  end
end
