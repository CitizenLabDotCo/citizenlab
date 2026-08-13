# frozen_string_literal: true

module DecidimImporter
  module Extractors
    # Per-process `NN---users.csv` (Decidim participatory-process user roles) ──▶ deferred
    # project-moderator assignments.
    #
    # Each row pairs a user uid with a role in the process (`uid,role`). Decidim staff roles (admin,
    # collaborator, moderator) become a Go Vocal `project_moderator`; `private_user` — a private-space
    # participant, not staff — is ignored. The role can't travel in the template: it lives in the user's
    # JSONB `roles` array as a `project_id` (no ref reaches into a JSON value), and the project id doesn't
    # exist until the template is deserialized. So this emits natural-key tuples — the user's `unique_code`
    # (its Decidim uid, preserved by {UsersExtractor}) and the project's `slug` — that {ModeratorAssigner}
    # applies *after* deserialization by looking both records up in the target tenant.
    class ProcessRolesExtractor < BaseExtractor
      COLUMNS = {
        user: 'uid',
        process: 'decidim_participatory_process',
        role: 'role'
      }.freeze

      # Decidim participatory-process roles that grant Go Vocal project moderation — every staff role,
      # but not the private-space participant role `private_user`.
      MODERATOR_ROLES = %w[admin collaborator moderator].freeze

      # @return [Array<Hash>] `{ 'user_unique_code' =>, 'project_slug' => }` tuples for {ModeratorAssigner}.
      def run
        rows.filter_map do |row|
          role = present_value(row[COLUMNS[:role]])&.downcase
          next unless MODERATOR_ROLES.include?(role)

          user_uid = present_value(row[COLUMNS[:user]])
          process_uid = present_value(row[COLUMNS[:process]])
          next if user_uid.nil? || process_uid.nil?

          assignment_for(user_uid, process_uid)
        end
      end

      private

      # The natural-key tuple for one role, or nil (skip-logged) when either side can't be resolved: the
      # user wasn't imported (spam/unconfirmed accounts are dropped by {UsersExtractor}), the process
      # wasn't imported, or its project has no explicit slug for {ModeratorAssigner} to match on.
      def assignment_for(user_uid, process_uid)
        user = ref_map.fetch(user_uid)
        return skip(user_uid, 'moderator role for a user that was not imported') unless user&.model_name == 'user'

        project = ref_map.fetch(process_uid)
        unless project&.model_name == 'project'
          return skip(user_uid, "moderator role for a process that was not imported (#{process_uid})")
        end

        slug = present_value(project.attributes['slug'])
        return skip(user_uid, "moderator role for a project with no slug (#{process_uid})") if slug.nil?

        { 'user_unique_code' => user_uid, 'project_slug' => slug }
      end
    end
  end
end
