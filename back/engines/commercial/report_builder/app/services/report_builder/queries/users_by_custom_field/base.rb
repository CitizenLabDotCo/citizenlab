module ReportBuilder
  class Queries::UsersByCustomField::Base < Queries::Base
    def run_query(start_at: nil, end_at: nil, project_id: nil, group_id: nil, **_other_props)
      users = find_users(start_at, end_at, project_id, group_id)
      custom_field = CustomField.find_by(key: custom_field_key)
      UserCustomFields::FieldValueCounter.counts_by_field_option(users, custom_field)
    end

    protected

    def custom_field_key
      raise NotImplementedError
    end

    private

    # Copied from UserCustomFields::...::StatsUsersController#find_users
    def find_users(start_at, end_at, project_id, group_id)
      users = StatUserPolicy::Scope.new(@current_user, User.active).resolve
      finder_params = {
        registration_date_range: start_at..end_at,
        project: project_id,
        group: group_id
      }
      UserCustomFields::UsersFinder.new(users, finder_params).execute
    end
  end
end
