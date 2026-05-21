# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Decidim `decidim_participatory_process_user_roles` ──▶ deferred moderator-role assignments.
    #
    # Project-scoped roles live in Go Vocal's JSONB `roles` array, which can't carry a template ref
    # to a not-yet-created project. So this extractor doesn't register template records; it returns
    # plain assignment tuples that {RoleAssigner} applies *after* deserialization, once project ids
    # exist.
    class ProcessRolesExtractor < BaseExtractor
      USER_TABLE = UsersExtractor::TABLE
      PROJECT_TABLE = ProjectsExtractor::TABLE

      COLUMNS = {
        user_id: 'decidim_user_id',
        process_id: 'decidim_participatory_process_id',
        role: 'role'
      }.freeze

      # Decidim roles that should become a Go Vocal project moderator.
      MODERATOR_ROLES = %w[admin moderator collaborator].freeze

      # @return [Array<Hash>] assignment tuples for RoleAssigner.
      def run
        rows.filter_map do |row|
          user_id = present_value(row[COLUMNS[:user_id]])
          process_id = present_value(row[COLUMNS[:process_id]])
          role = present_value(row[COLUMNS[:role]])&.downcase
          next if user_id.nil? || process_id.nil?
          next unless MODERATOR_ROLES.include?(role)

          {
            user_key: RefMap.key(USER_TABLE, user_id),
            target_key: RefMap.key(PROJECT_TABLE, process_id),
            role: 'project_moderator',
            scope_attribute: 'project_id'
          }
        end
      end
    end
  end
end
