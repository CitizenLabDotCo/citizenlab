# frozen_string_literal: true

module DecidimImporter
  # Applies project-moderator roles *after* the template is deserialized, from the natural-key tuples
  # {Extractors::ProcessRolesExtractor} produced (a user `unique_code` + a project `slug`).
  #
  # These roles can't travel in the template — they live in the user's JSONB `roles` array as a
  # `project_id`, which no ref resolves and which doesn't exist until the projects are created. So we
  # wait until the records exist in the target tenant, then look each side up by its natural key:
  # {UsersExtractor} stores the Decidim uid verbatim in `User#unique_code`, and the project keeps its
  # Decidim `slug`. Both work whether the template was applied in-memory (`TemplateCreator#import`) or
  # from a dumped YAML on a production tenant — unlike a positional correlation, neither needs the
  # in-memory ref map. Runs inside the target tenant. Idempotent: a role already present is left as-is.
  class ModeratorAssigner
    def initialize(logger: Rails.logger)
      @logger = logger
    end

    # @param assignments [Array<Hash>] `{ 'user_unique_code' =>, 'project_slug' => }` tuples.
    # @return [Integer] number of moderator roles added (existing ones aren't re-counted).
    def assign(assignments)
      return 0 if assignments.blank?

      # One query per distinct key rather than per row: a user or project can moderate/be moderated many times.
      users = User.where(unique_code: assignments.pluck('user_unique_code').uniq).index_by(&:unique_code)
      projects = Project.where(slug: assignments.pluck('project_slug').uniq).index_by(&:slug)

      applied = 0
      assignments.each do |assignment|
        applied += 1 if apply(assignment, users, projects)
      end
      applied
    end

    private

    # Adds one moderator role, or returns false (skip-logged) when its user/project is missing in the
    # tenant or the user already moderates the project.
    def apply(assignment, users, projects)
      user = users[assignment['user_unique_code']]
      project = projects[assignment['project_slug']]
      return log_skip(assignment, 'user not found in tenant') if user.nil?
      return log_skip(assignment, "project '#{assignment['project_slug']}' not found in tenant") if project.nil?
      return false if user.project_moderator?(project.id)

      user.add_role('project_moderator', project_id: project.id)
      user.save!
      true
    end

    def log_skip(assignment, reason)
      @logger.warn "Decidim import: skipping moderator role for #{assignment['user_unique_code']} — #{reason}"
      false
    end
  end
end
