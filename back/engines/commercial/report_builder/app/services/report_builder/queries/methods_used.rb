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
      start_at, end_at = TimeBoundaries.parse(start_at, end_at)

      json_response = {
        count_per_method: get_methods_used_in_overlapping_phases(
          start_at,
          end_at,
          publication_statuses
        )
      }

      if compare_start_at.present? && compare_end_at.present?
        compare_start_at, compare_end_at = TimeBoundaries.parse(compare_start_at, compare_end_at)
        json_response[:count_per_method_compared_period] = get_methods_used_in_overlapping_phases(
          compare_start_at, compare_end_at, publication_statuses
        )
      end

      json_response
    end

    # @return [Hash{String => Integer}]
    def get_methods_used_in_overlapping_phases(start_at, end_at, publication_statuses)
      non_overlapping_phases = Phase.where('end_at <= ? OR start_at >= ?', start_at, end_at)
      statuses = publication_statuses.presence || %w[published archived]

      phases = Phase
        .where.not(id: non_overlapping_phases)
        .where(project: Project.where(admin_publication: AdminPublication.with_status(statuses)))

      phases.group(:participation_method).count
    end
  end
end
