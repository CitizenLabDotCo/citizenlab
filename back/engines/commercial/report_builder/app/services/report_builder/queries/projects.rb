module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, **_other_props)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      projects_that_have_phases_ids = Phase.select(:project_id)

      far_future_date = Time.zone.today + 10.years

      project_periods = Phase
        .group(:project_id)
        .select("project_id, min(start_at) as start_at, max(start_at) as last_phase_start_at, max(coalesce(end_at, '#{far_future_date}'::DATE)) as end_at")
        .to_a

      non_overlapping_project_period_ids = project_periods
        .select do |period|
          period.start_at >= end_date || period.end_at <= start_date
        end
        .map(&:project_id)

      overlapping_projects = Project
        .where(id: projects_that_have_phases_ids)
        .where.not(id: non_overlapping_project_period_ids)

      overlapping_project_ids = overlapping_projects.select(:id)

      project_images_hash = ProjectImage
        .where(project_id: overlapping_project_ids)
        .to_a
        .each_with_object({}) do |project_image, hash|
          hash[project_image.id] = serialize(project_image, ::WebApi::V1::ImageSerializer)
        end

      periods = project_periods.each_with_object({}) do |period, hash|
        next if period.project_id.in?(non_overlapping_project_period_ids)

        hash[period.project_id] = {
          start_at: period.start_at,
          last_phase_start_at: period.last_phase_start_at,
          end_at: period.end_at == far_future_date ? nil : period.end_at
        }
      end

      participants = Analytics::FactParticipation
        .where(dimension_project_id: overlapping_project_ids)
        .group(:dimension_project_id)
        .select('COUNT(DISTINCT participant_id) as participants_count, dimension_project_id')
        .to_a
        .each_with_object({}) do |participant, hash|
          hash[participant.dimension_project_id] = participant.participants_count
        end

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
