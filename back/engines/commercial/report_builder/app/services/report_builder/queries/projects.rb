module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, **_other_props)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      periods_query = Phase
        .where(project_id: overlapping_projects.select(:id))
        .group(:project_id)
        .select('project_id, min(start_at) as start_at, max(end_at) as end_at')

      project_images_hash = ProjectImage
        .where(project_id: overlapping_projects.select(:id))
        .to_a
        .each_with_object({}) do |project_image, hash|
          hash[project_image.id] = serialize(project_image, ::WebApi::V1::ImageSerializer)
        end

      periods = periods_query
        .to_a
        .each_with_object({}) do |row, hash|
          hash[row.project_id] = { start_at: row.start_at, end_at: row.end_at }
        end

      {
        projects: serialize(overlapping_projects, ::WebApi::V1::ProjectSerializer),
        project_images: project_images_hash,
        periods: periods
      }
    end

    private

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
