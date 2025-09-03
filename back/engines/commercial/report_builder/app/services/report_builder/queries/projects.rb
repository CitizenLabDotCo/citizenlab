module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, publication_statuses: ['published'], **_other_props)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      overlapping_project_ids = Phase
        .select(:project_id)
        .where("(start_at, coalesce(end_at, 'infinity'::DATE)) OVERLAPS (?, ?)", start_date, end_date)

      overlapping_projects = Project
        .joins(:admin_publication)
        .where(id: overlapping_project_ids)
        .where(admin_publication: { publication_status: publication_statuses })
        .not_hidden

      periods = Phase
        .select(
          :project_id,
          'min(start_at) as start_at',
          'CASE WHEN count(end_at) = count(*) THEN max(end_at) ELSE NULL END as end_at'
        )
        .where(project_id: overlapping_project_ids)
        .group(:project_id)
        .to_h do |period|
        [
          period.project_id,
          period.slice(:start_at, :end_at)
        ]
      end

      project_images_hash = ProjectImage
        .where(project_id: overlapping_projects)
        .to_h { |project_image| [project_image.id, serialize(project_image, ::WebApi::V1::ImageSerializer)] }

      participants = Analytics::FactParticipation
        .where(dimension_project_id: overlapping_project_ids)
        .group(:dimension_project_id)
        .select('COUNT(DISTINCT participant_id) as participants_count, dimension_project_id')
        .to_h { |participant| [participant.dimension_project_id, participant.participants_count] }

      {
        projects: serialize(overlapping_projects, ::WebApi::V1::ProjectSerializer),
        project_images: project_images_hash,
        periods: periods,
        participants: participants
      }
    end

    private

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
