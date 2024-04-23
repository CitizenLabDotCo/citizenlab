module ReportBuilder
  class Queries::Demographics < ReportBuilder::Queries::Base
    def run_query(
      custom_field_id,
      start_at: nil,
      end_at: nil,
      project_id: nil,
      group_id: nil,
      **_other_props
    )
      users = find_users(start_at, end_at, project_id, group_id)
      custom_field = CustomField.find(custom_field_id)

      json_response = {
        series: UserCustomFields::FieldValueCounter.counts_by_field_option(users, custom_field)
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
      users = StatUserPolicy::Scope.new(@current_user, User.active).resolve
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse
      finder_params = {
        registration_date_range: start_date..end_date,
        project: project_id,
        group: group_id
      }

      UserCustomFields::UsersFinder.new(users, finder_params).execute
    end
  end
end
