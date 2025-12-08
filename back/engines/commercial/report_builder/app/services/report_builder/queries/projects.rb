module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(params = {})
      extract_params = extract_parameters(params)
      start_date, end_date, no_data = TimeBoundariesParser.new(extract_params[:start_at], extract_params[:end_at]).parse

      return empty_result if no_data

      finder_params = {
        **extract_params.except(:start_at, :end_at),
        phase_start_date: start_date,
        phase_end_date: end_date
      }
      projects = ProjectsFinderAdminService.execute(
        Project.not_hidden,
        finder_params,
        current_user: @current_user
      )

      filtered_project_ids = projects.pluck(:id)

      {
        projects: serialize(projects, ::WebApi::V1::ProjectSerializer),
        project_images: fetch_project_images(projects),
        periods: fetch_project_periods(filtered_project_ids),
        participants: fetch_project_participants(filtered_project_ids)
      }
    end

    private

    def extract_parameters(params)
      {
        start_at: params[:start_at],
        end_at: params[:end_at],
        status: params[:publication_statuses] || ['published'],
        sort: params[:sort],
        locale: params[:locale] || 'en',
        excluded_project_ids: params[:excluded_project_ids] || [],
        excluded_folder_ids: params[:excluded_folder_ids] || []
      }
    end

    def empty_result
      {
        projects: [],
        project_images: {},
        periods: {},
        participants: {}
      }
    end

    def fetch_project_periods(project_ids)
      Phase
        .select(
          :project_id,
          'min(start_at) as start_at',
          'CASE WHEN count(end_at) = count(*) THEN max(end_at) ELSE NULL END as end_at'
        )
        .where(project_id: project_ids)
        .group(:project_id)
        .to_h do |period|
        [
          period.project_id,
          period.slice(:start_at, :end_at)
        ]
      end
    end

    def fetch_project_images(projects)
      ProjectImage
        .where(project_id: projects)
        .to_h { |project_image| [project_image.id, serialize(project_image, ::WebApi::V1::ImageSerializer)] }
    end

    def fetch_project_participants(project_ids)
      Analytics::FactParticipation
        .where(dimension_project_id: project_ids)
        .group(:dimension_project_id)
        .select('COUNT(DISTINCT participant_id) as participants_count, dimension_project_id')
        .to_h { |participant| [participant.dimension_project_id, participant.participants_count] }
    end

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
