module ReportBuilder
  class Queries::Demographics < ReportBuilder::Queries::Base
    def run_query(
      custom_field_id: nil,
      start_at: nil,
      end_at: nil,
      project_id: nil,
      group_id: nil,
      **_other_props
    )
      return {} if custom_field_id.blank?

      custom_field = CustomField.find(custom_field_id)

      users = find_users(start_at, end_at, project_id, group_id)
      series = UserCustomFields::FieldValueCounter.counts_by_field_option(users, custom_field)

      # Demographics can also be found in ideas where user_fields_in_form is enabled
      ideas = find_demographics_in_ideas(start_at, end_at, project_id)
      if ideas
        series_from_ideas = UserCustomFields::FieldValueCounter.counts_by_field_option(ideas, custom_field, record_type: 'ideas')
        series = series.merge(series_from_ideas) { |_key, user_val, idea_val| user_val + idea_val }
      end

      json_response = {
        series: series
      }

      if custom_field.options.present?
        json_response[:options] = custom_field.options.to_h do |o|
          [o.key, o.attributes.slice('title_multiloc', 'ordering')]
        end
      end

      json_response
    end

    private

    # Copied from UserCustomFields::...::StatsUsersController#find_users
    def find_users(start_at, end_at, project_id, group_id)
      # TODO: Find a way to pass the policy context when instantiating the scope.
      #   This should not cause any issue since the current usage of the policy context
      #   does not impact the report queries. But for consistency, we should find a way
      #   to pass the policy context.
      users = StatUserPolicy::Scope.new(@current_user, User.active).resolve
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse
      finder_params = {
        registration_date_range: start_date..end_date,
        project: project_id,
        group: group_id
      }

      UserCustomFields::UsersFinder.new(users, finder_params).execute
    end

    # Find ideas (survey responses) from phases where User fields are stored in the idea
    # if there are any phases where user_fields_in_form is enabled
    def find_demographics_in_ideas(start_at, end_at, project_id)
      return unless project_id # Only do this if filtered by project

      phases = Phase.where(project_id: project_id, user_fields_in_form: true)
      return if phases.blank?

      # Only find published ideas with null users, as any user demographics will already be included
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse
      Idea.published.where(author: nil, creation_phase: phases, created_at: start_date..end_date)
    end
  end
end
