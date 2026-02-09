module ReportBuilder
  class Queries::MethodsUsed < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      publication_statuses: nil,
      **_other_props
    )
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      json_response = {
        count_per_method: get_methods_used_in_overlapping_phases(
          start_date,
          end_date,
          publication_statuses
        )
      }

      if compare_start_at.present? && compare_end_at.present?
        json_response[:count_per_method_compared_period] = get_methods_used_in_overlapping_phases(
          compare_start_at, compare_end_at, publication_statuses
        )
      end

      json_response
    end

    def get_methods_used_in_overlapping_phases(start_date, end_date, publication_statuses)
      non_overlapping_phase_ids = Phase.where('end_at <= ? OR start_at >= ?', start_date, end_date).select(:id)

      query = Phase
        .joins(project: :admin_publication)
        .where.not(id: non_overlapping_phase_ids)

      # Filter by publication status: specific statuses if provided, otherwise exclude drafts
      publication_filter = publication_statuses.presence || %w[published archived]
      query.where(admin_publication: { publication_status: publication_filter })
        .group(:participation_method)
        .count
    end
  end
end
