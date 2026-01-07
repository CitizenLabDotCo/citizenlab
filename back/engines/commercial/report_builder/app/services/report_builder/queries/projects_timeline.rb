module ReportBuilder
  class Queries::ProjectsTimeline < ReportBuilder::Queries::Base
    def run_query(params = {})
      extract_params = extract_parameters(params)
      projects_with_phases = fetch_projects_with_phases(extract_params)
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
        status: params[:status] || ['published'],
        managers: params[:managers] || [],
        min_start_date: params[:min_start_date],
        max_start_date: params[:max_start_date],
        participation_states: params[:participation_states] || [],
        folder_ids: params[:folder_ids] || [],
        participation_methods: params[:participation_methods] || [],
        visibility: params[:visibility] || [],
        discoverability: params[:discoverability] || [],
        sort: params[:sort] || 'recently_created_desc',
        no_of_projects: params[:no_of_projects],
        excluded_project_ids: params[:excluded_project_ids] || [],
        excluded_folder_ids: params[:excluded_folder_ids] || [],
        locale: params[:locale] || 'en'
      }
    end

    def fetch_projects_with_phases(params)
      page_size = params[:no_of_projects]

      # Use ProjectsFinderAdminService.execute to handle all filtering and sorting
      projects_query = build_base_query
      projects_query = ProjectsFinderAdminService.execute(projects_query, extract_parameters(params), current_user: @current_user)

      if page_size
        projects_query = projects_query.limit(page_size)
      end

      projects_query.to_a
    end

    def build_base_query
      Project.joins(:admin_publication).not_hidden
    end

    def build_timeline_items(projects_with_phases)
      projects_with_phases.map do |project|
        # Calculate phase data similar to ProjectMiniAdminSerializer
        first_phase = project.phases.order(:start_at).first
        last_phase = project.phases.order(:start_at).last
        current_phase = TimelineService.new.current_phase(project)

        {
          id: project.id,
          title: project.title_multiloc,
          start_date: first_phase&.start_at || project.admin_publication.first_published_at,
          end_date: last_phase&.end_at,
          current_phase_start_date: current_phase&.start_at,
          current_phase_end_date: current_phase&.end_at,
          publication_status: project.admin_publication.publication_status,
          folder_title_multiloc: project.folder&.title_multiloc
        }
      end
    end
  end
end
