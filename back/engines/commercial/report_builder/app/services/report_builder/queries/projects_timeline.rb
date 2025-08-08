module ReportBuilder
  class Queries::ProjectsTimeline < ReportBuilder::Queries::Base
    def run_query(params = {})
      extract_params = extract_parameters(params)
      projects = fetch_filtered_projects(extract_params)
      projects_with_phases = fetch_projects_with_phases(projects)
      timeline_items = build_timeline_items(projects_with_phases)

      {
        timeline_items: timeline_items
      }
    end

    private

    def extract_parameters(params)
      {
        start_at: params[:start_at],
        end_at: params[:end_at],
        publication_statuses: params[:publication_statuses] || ['published'],
        participation_states: params[:participation_states] || [],
        visibility: params[:visibility] || [],
        discoverability: params[:discoverability] || [],
        managers: params[:managers] || [],
        folder_ids: params[:folder_ids] || [],
        participation_methods: params[:participation_methods] || [],
        sort: params[:sort] || 'phase_starting_or_ending_soon',
        number_of_projects: params[:number_of_projects] || 10
      }
    end

    def fetch_filtered_projects(params)
      start_date, end_date = TimeBoundariesParser.new(params[:start_at], params[:end_at]).parse

      projects_query = build_base_query
      projects_query = apply_all_filters(projects_query, params, start_date, end_date)
      projects_query = apply_sorting(projects_query, params[:sort])
      projects_query = projects_query.limit(params[:number_of_projects])

      projects_query.to_a
    end

    def build_base_query
      Project.joins(:admin_publication).not_hidden
    end

    def apply_all_filters(query, params, start_date, end_date)
      query
        .then { |q| apply_publication_status_filter(q, params[:publication_statuses]) }
        .then { |q| apply_participation_states_filter(q, params[:participation_states]) }
        .then { |q| apply_visibility_filter(q, params[:visibility]) }
        .then { |q| apply_discoverability_filter(q, params[:discoverability]) }
        .then { |q| apply_managers_filter(q, params[:managers]) }
        .then { |q| apply_folder_ids_filter(q, params[:folder_ids]) }
        .then { |q| apply_participation_methods_filter(q, params[:participation_methods]) }
        .then { |q| apply_date_range_filter(q, start_date, end_date) }
    end

    def fetch_projects_with_phases(projects)
      Project
        .where(id: projects.map(&:id))
        .joins(
          'LEFT JOIN LATERAL (' \
          'SELECT phases.id AS first_phase_id, phases.start_at AS first_phase_start_at ' \
          'FROM phases ' \
          'WHERE phases.project_id = projects.id ' \
          'ORDER BY phases.start_at ASC ' \
          'LIMIT 1' \
          ') AS first_phases ON true'
        )
        .joins(
          'LEFT JOIN LATERAL (' \
          'SELECT phases.id AS last_phase_id, phases.end_at AS last_phase_end_at ' \
          'FROM phases ' \
          'WHERE phases.project_id = projects.id ' \
          'ORDER BY phases.end_at DESC ' \
          'LIMIT 1' \
          ') AS last_phases ON true'
        )
        .joins(
          'LEFT JOIN LATERAL (' \
          'SELECT phases.id AS current_phase_id, phases.start_at AS current_phase_start_at, phases.end_at AS current_phase_end_at ' \
          'FROM phases ' \
          'WHERE phases.project_id = projects.id ' \
          'AND phases.start_at <= CURRENT_DATE ' \
          'AND (phases.end_at IS NULL OR phases.end_at >= CURRENT_DATE) ' \
          'ORDER BY phases.start_at DESC ' \
          'LIMIT 1' \
          ') AS current_phases ON true'
        )
        .select('projects.*, first_phases.first_phase_start_at, last_phases.last_phase_end_at, current_phases.current_phase_start_at, current_phases.current_phase_end_at')
    end

    def build_timeline_items(projects_with_phases)
      projects_with_phases.map do |project|
        {
          id: project.id,
          title: project.title_multiloc,
          start_date: project.first_phase_start_at || project.first_published_at,
          end_date: project.last_phase_end_at,
          current_phase_start_date: project.current_phase_start_at,
          current_phase_end_date: project.current_phase_end_at,
          publication_status: project.admin_publication.publication_status,
          folder_title_multiloc: project.folder&.title_multiloc
        }
      end
    end

    def apply_publication_status_filter(query, statuses)
      ProjectsFinderAdminService.filter_status_and_review_state(query, { status: statuses })
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
      ProjectsFinderAdminService.filter_project_manager(query, { managers: manager_ids })
    end

    def apply_folder_ids_filter(query, folder_ids)
      ProjectsFinderAdminService.filter_by_folder_ids(query, { folder_ids: folder_ids })
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
        ProjectsFinderAdminService.sort_recently_viewed(query, @current_user)
      when 'phase_starting_or_ending_soon'
        ProjectsFinderAdminService.sort_phase_starting_or_ending_soon(query)
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
