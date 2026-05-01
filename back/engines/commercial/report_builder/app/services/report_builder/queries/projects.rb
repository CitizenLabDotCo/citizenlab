module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(params = {})
      extract_params = extract_parameters(params)
      start_at, end_at, no_data = TimeBoundaries.parse(extract_params[:start_at], extract_params[:end_at])

      return empty_result if no_data

      finder_params = {
        **extract_params.except(:start_at, :end_at),
        phase_start_date: start_at,
        phase_end_date: end_at
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
        start_at = period.start_at&.to_date
        end_at = if period.end_at
          end_date = period.end_at.to_date
          # Subtract one day if end_at falls exactly on midnight, because the end
          # boundary is exclusive (the phase is no longer active at that point).
          period.end_at.seconds_since_midnight.zero? ? end_date - 1.day : end_date
        end

        [period.project_id, { start_at:, end_at: }]
      end
    end

    def fetch_project_images(projects)
      ProjectImage
        .where(project_id: projects)
        .to_h { |project_image| [project_image.id, serialize(project_image, ::WebApi::V1::ImageSerializer)] }
    end

    def fetch_project_participants(project_ids)
      return {} if project_ids.empty?

      sql = <<~SQL.squish
        SELECT project_id, COUNT(DISTINCT participant_id) AS participants_count FROM (
          SELECT COALESCE(i.author_id::TEXT, i.author_hash, i.id::TEXT) AS participant_id, i.project_id
          FROM ideas i WHERE i.project_id IN (:project_ids) AND i.publication_status = 'published'
          UNION ALL
          SELECT COALESCE(c.author_id::TEXT, c.author_hash, c.id::TEXT), i.project_id
          FROM comments c INNER JOIN ideas i ON c.idea_id = i.id WHERE i.project_id IN (:project_ids)
          UNION ALL
          SELECT COALESCE(r.user_id::TEXT, r.id::TEXT), i.project_id
          FROM reactions r INNER JOIN ideas i ON i.id = r.reactable_id
          WHERE i.project_id IN (:project_ids) AND r.reactable_type = 'Idea'
          UNION ALL
          SELECT COALESCE(r.user_id::TEXT, r.id::TEXT), i.project_id
          FROM reactions r INNER JOIN comments c ON c.id = r.reactable_id
          INNER JOIN ideas i ON i.id = c.idea_id
          WHERE i.project_id IN (:project_ids) AND r.reactable_type = 'Comment'
          UNION ALL
          SELECT COALESCE(pr.user_id::TEXT, pr.id::TEXT), p.project_id
          FROM polls_responses pr INNER JOIN phases p ON p.id = pr.phase_id
          WHERE p.project_id IN (:project_ids)
          UNION ALL
          SELECT COALESCE(vv.user_id::TEXT, vv.id::TEXT), p.project_id
          FROM volunteering_volunteers vv INNER JOIN volunteering_causes vc ON vc.id = vv.cause_id
          INNER JOIN phases p ON p.id = vc.phase_id WHERE p.project_id IN (:project_ids)
          UNION ALL
          SELECT COALESCE(b.user_id::TEXT, b.id::TEXT), p.project_id
          FROM baskets b INNER JOIN phases p ON p.id = b.phase_id WHERE p.project_id IN (:project_ids)
          UNION ALL
          SELECT ea.attendee_id::TEXT, e.project_id
          FROM events_attendances ea INNER JOIN events e ON e.id = ea.event_id
          WHERE e.project_id IN (:project_ids)
        ) AS all_participations
        GROUP BY project_id
      SQL

      ActiveRecord::Base.connection.select_all(
        ActiveRecord::Base.sanitize_sql([sql, { project_ids: project_ids }])
      ).to_h { |row| [row['project_id'], row['participants_count'].to_i] }
    end

    def serialize(entity, serializer)
      serializer.new(entity, params: { current_user: @current_user }).serializable_hash[:data]
    end
  end
end
