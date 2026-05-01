module ReportBuilder
  class Queries::Participants < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: 'month',
      exclude_roles: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_at, end_at = TimeBoundaries.parse(start_at, end_at)

      # Time series
      participants_timeseries = participations_timeseries(
        start_at, end_at, resolution,
        project_id: project_id, exclude_roles: exclude_roles
      )

      participants_whole_period = count_participants(
        start_at, end_at,
        project_id: project_id, exclude_roles: exclude_roles
      )

      response = {
        participants_timeseries: participants_timeseries,
        participants_whole_period: participants_whole_period,
        participation_rate_whole_period: participation_rate_as_percent(
          participants_whole_period, start_at, end_at,
          project_id: project_id, exclude_roles: exclude_roles
        )
      }

      if compare_start_at && compare_end_at
        compare_start_at, compare_end_at = TimeBoundaries.parse(compare_start_at, compare_end_at)
        participants_compared_period = count_participants(
          compare_start_at, compare_end_at,
          project_id: project_id, exclude_roles: exclude_roles
        )

        response[:participants_compared_period] = participants_compared_period
        response[:participation_rate_compared_period] = participation_rate_as_percent(
          participants_compared_period, compare_start_at, compare_end_at,
          project_id: project_id, exclude_roles: exclude_roles
        )
      end

      response
    end

    private

    def participations_timeseries(start_at, end_at, resolution, project_id: nil, exclude_roles: nil)
      union_sql = participations_union_sql(
        start_at: start_at, end_at: end_at,
        project_id: project_id, exclude_roles: exclude_roles
      )

      sql = <<~SQL.squish
        SELECT
          COUNT(DISTINCT participant_id) AS participants,
          date_trunc('#{resolution}', created_at) AS date_group
        FROM (#{union_sql}) AS all_participations
        GROUP BY date_group
        ORDER BY date_group
      SQL

      ActiveRecord::Base.connection.select_all(
        ActiveRecord::Base.sanitize_sql(sql)
      ).map do |row|
        {
          participants: row['participants'].to_i,
          date_group: row['date_group'].to_date
        }
      end
    end

    def count_participants(start_at, end_at, project_id: nil, exclude_roles: nil)
      union_sql = participations_union_sql(
        start_at: start_at, end_at: end_at,
        project_id: project_id, exclude_roles: exclude_roles
      )

      sql = "SELECT COUNT(DISTINCT participant_id) FROM (#{union_sql}) AS all_participations"

      ActiveRecord::Base.connection.select_value(
        ActiveRecord::Base.sanitize_sql(sql)
      ).to_i
    end

    def participations_union_sql(start_at:, end_at:, project_id: nil, exclude_roles: nil)
      date_filter = sanitize_sql(
        'created_at >= ? AND created_at < ?', start_at, end_at
      )

      project_filter = if project_id.present?
        sanitize_sql(' AND project_id = ?', project_id)
      else
        ''
      end

      phase_project_filter = if project_id.present?
        sanitize_sql(' AND p.project_id = ?', project_id)
      else
        ''
      end

      role_join = if exclude_roles == 'exclude_admins_and_moderators'
        "INNER JOIN users u ON u.id = user_id AND jsonb_array_length(u.roles) = 0"
      else
        ''
      end

      # For ideas/comments where the author might be anonymous, the role filter
      # joins on author_id. For anonymous participations (no author_id), they are
      # excluded by the INNER JOIN when role filtering is active, which is correct
      # (anonymous participants don't have admin roles).
      author_role_join = if exclude_roles == 'exclude_admins_and_moderators'
        "INNER JOIN users u ON u.id = author_id AND jsonb_array_length(u.roles) = 0"
      else
        ''
      end

      <<~SQL.squish
        SELECT COALESCE(i.author_id::TEXT, i.author_hash, i.id::TEXT) AS participant_id, i.created_at
        FROM ideas i #{author_role_join.gsub('author_id', 'i.author_id').gsub('user_id', 'i.author_id')}
        WHERE i.publication_status = 'published' AND #{date_filter.gsub('created_at', 'i.created_at')}#{project_filter.gsub('project_id', 'i.project_id')}

        UNION ALL

        SELECT COALESCE(c.author_id::TEXT, c.author_hash, c.id::TEXT), c.created_at
        FROM comments c
        INNER JOIN ideas i ON c.idea_id = i.id
        #{author_role_join.gsub('author_id', 'c.author_id').gsub('user_id', 'c.author_id')}
        WHERE #{date_filter.gsub('created_at', 'c.created_at')}#{project_filter.gsub('project_id', 'i.project_id')}

        UNION ALL

        SELECT COALESCE(r.user_id::TEXT, r.id::TEXT), r.created_at
        FROM reactions r INNER JOIN ideas i ON i.id = r.reactable_id
        #{role_join.gsub('user_id', 'r.user_id')}
        WHERE r.reactable_type = 'Idea' AND #{date_filter.gsub('created_at', 'r.created_at')}#{project_filter.gsub('project_id', 'i.project_id')}

        UNION ALL

        SELECT COALESCE(r.user_id::TEXT, r.id::TEXT), r.created_at
        FROM reactions r INNER JOIN comments c ON c.id = r.reactable_id
        INNER JOIN ideas i ON i.id = c.idea_id
        #{role_join.gsub('user_id', 'r.user_id')}
        WHERE r.reactable_type = 'Comment' AND #{date_filter.gsub('created_at', 'r.created_at')}#{project_filter.gsub('project_id', 'i.project_id')}

        UNION ALL

        SELECT COALESCE(pr.user_id::TEXT, pr.id::TEXT), pr.created_at
        FROM polls_responses pr INNER JOIN phases p ON p.id = pr.phase_id
        #{role_join.gsub('user_id', 'pr.user_id')}
        WHERE #{date_filter.gsub('created_at', 'pr.created_at')}#{phase_project_filter}

        UNION ALL

        SELECT COALESCE(vv.user_id::TEXT, vv.id::TEXT), vv.created_at
        FROM volunteering_volunteers vv INNER JOIN volunteering_causes vc ON vc.id = vv.cause_id
        INNER JOIN phases p ON p.id = vc.phase_id
        #{role_join.gsub('user_id', 'vv.user_id')}
        WHERE #{date_filter.gsub('created_at', 'vv.created_at')}#{phase_project_filter}

        UNION ALL

        SELECT COALESCE(b.user_id::TEXT, b.id::TEXT), b.created_at
        FROM baskets b INNER JOIN phases p ON p.id = b.phase_id
        #{role_join.gsub('user_id', 'b.user_id')}
        WHERE #{date_filter.gsub('created_at', 'b.created_at')}#{phase_project_filter}

        UNION ALL

        SELECT ea.attendee_id::TEXT, ea.created_at
        FROM events_attendances ea INNER JOIN events e ON e.id = ea.event_id
        #{role_join.gsub('user_id', 'ea.attendee_id')}
        WHERE #{date_filter.gsub('created_at', 'ea.created_at')}#{project_filter.gsub('project_id', 'e.project_id')}
      SQL
    end

    def participation_rate_as_percent(participants, start_at, end_at, project_id: nil, exclude_roles: nil)
      visits_service = Insights::VisitsService.new(project_id, start_at:, end_at:, exclude_roles:)
      visitors = visits_service.total_visits[:visitors]
      visitors.zero? ? 0 : (participants / visitors.to_f)
    end
  end
end
