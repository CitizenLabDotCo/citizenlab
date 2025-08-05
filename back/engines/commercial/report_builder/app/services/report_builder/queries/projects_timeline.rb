module ReportBuilder
  class Queries::ProjectsTimeline < ReportBuilder::Queries::Base
    def run_query(params = {})
      # Extract parameters with defaults
      start_at = params[:start_at]
      end_at = params[:end_at]
      publication_statuses = params[:publication_statuses] || ['published']
      participation_states = params[:participation_states] || []
      visibility = params[:visibility] || []
      discoverability = params[:discoverability] || []
      managers = params[:managers] || []
      folder_ids = params[:folder_ids] || []
      participation_methods = params[:participation_methods] || []
      sort = params[:sort] || 'phase_starting_or_ending_soon'
      number_of_projects = params[:number_of_projects] || 10

      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      # Build the base query for projects
      projects_query = Project
        .joins(:admin_publication)
        .not_hidden

      # Apply filters
      projects_query = apply_publication_status_filter(projects_query, publication_statuses)
      projects_query = apply_participation_states_filter(projects_query, participation_states)
      projects_query = apply_visibility_filter(projects_query, visibility)
      projects_query = apply_discoverability_filter(projects_query, discoverability)
      projects_query = apply_managers_filter(projects_query, managers)
      projects_query = apply_folder_ids_filter(projects_query, folder_ids)
      projects_query = apply_participation_methods_filter(projects_query, participation_methods)
      projects_query = apply_date_range_filter(projects_query, start_date, end_date)

      # Apply sorting
      projects_query = apply_sorting(projects_query, sort)

      # Limit results
      projects_query = projects_query.limit(number_of_projects)

      # Get the projects
      projects = projects_query.to_a

      # Get phases for the projects
      project_ids = projects.map(&:id)
      phases = Phase.where(project_id: project_ids).order(:start_at)

      # Group phases by project
      phases_by_project = phases.group_by(&:project_id)

      # Build timeline data
      timeline_items = projects.map do |project|
        project_phases = phases_by_project[project.id] || []

        # Find first and last phase dates
        first_phase = project_phases.min_by(&:start_at)
        last_phase = project_phases.max_by(&:end_at)

        # Find current phase (if any)
        current_phase = project_phases.find do |phase|
          phase.start_at <= Date.current && (phase.end_at.nil? || phase.end_at >= Date.current)
        end

        {
          id: project.id,
          title: project.title_multiloc,
          start_date: first_phase&.start_at || project.first_published_at,
          end_date: last_phase&.end_at,
          current_phase_start_date: current_phase&.start_at,
          current_phase_end_date: current_phase&.end_at,
          publication_status: project.admin_publication.publication_status,
          folder_title_multiloc: project.folder&.title_multiloc
        }
      end

      {
        timeline_items: timeline_items,
        projects: serialize(projects, ::WebApi::V1::ProjectSerializer)
      }
    end

    private

    def apply_publication_status_filter(query, statuses)
      return query if statuses.blank?

      query.where(admin_publication: { publication_status: statuses })
    end

    def apply_participation_states_filter(query, states)
      ProjectsFinderAdminService.filter_participation_states(query, { participation_states: states })
    end

    def apply_visibility_filter(query, visibility)
      ProjectsFinderAdminService.filter_visibility(query, { visibility: visibility })
    end

    def apply_discoverability_filter(query, discoverability)
      ProjectsFinderAdminService.filter_discoverability(query, { discoverability: discoverability })
    end

    def apply_managers_filter(query, manager_ids)
      return query if manager_ids.blank?

      # Filter projects that have any of the specified users as moderators
      # Moderators are stored in the roles JSON field of users
      moderator_conditions = manager_ids.map do |manager_id|
        sanitized_manager_id = ActiveRecord::Base.connection.quote(manager_id)
        "EXISTS (
          SELECT 1 FROM users
          WHERE users.id = #{sanitized_manager_id}
          AND users.roles @> '[{\"type\": \"project_moderator\", \"project_id\": \"' || projects.id || '\"}]'
        )"
      end.join(' OR ')

      query.where(moderator_conditions)
    end

    def apply_folder_ids_filter(query, folder_ids)
      return query if folder_ids.blank?

      query.where(folder_id: folder_ids)
    end

    def apply_participation_methods_filter(query, methods)
      ProjectsFinderAdminService.filter_current_phase_participation_method(query, { participation_methods: methods })
    end

    def apply_date_range_filter(query, start_date, end_date)
      if start_date && end_date
        # Find projects that have phases overlapping with the date range
        overlapping_project_ids = Phase
          .select(:project_id)
          .where("(start_at, coalesce(end_at, 'infinity'::DATE)) OVERLAPS (?, ?)", start_date, end_date)
          .distinct

        query.where(id: overlapping_project_ids)
      else
        query
      end
    end

    def apply_sorting(query, sort)
      case sort
      when 'recently_viewed'
        # This would need to be implemented based on your view tracking logic
        # For now, fall back to created_at order
        query.order(created_at: :desc)
      when 'phase_starting_or_ending_soon'
        ProjectsFinderAdminService.sort_phase_starting_or_ending_soon(query)
      when 'recently_created'
        query.order(created_at: :desc)
      when 'alphabetically_asc', 'alphabetically_desc'
        ProjectsFinderAdminService.sort_alphabetically(query, { sort: sort })
      else
        query.order(created_at: :desc)
      end
    end

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
