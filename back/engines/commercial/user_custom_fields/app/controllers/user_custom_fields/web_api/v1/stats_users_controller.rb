# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class StatsUsersController < ::WebApi::V1::StatsController
        XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        private_constant :XLSX_MIME_TYPE

        def users_by_custom_field
          json_response = { series: { users: user_counts } }

          if custom_field.custom_field_options.present?
            options = custom_field.custom_field_options.to_h { |o| [o.key, o.attributes.slice('title_multiloc')] }
            json_response[:options] = options
          end

          render json: json_response
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_custom_field_as_xlsx
          counts = user_counts

          if custom_field.custom_field_options.present?
            res = custom_field.custom_field_options.map do |option|
              {
                'option_id' => option.key,
                'option' => MultilocService.new.t(option.title_multiloc),
                'users' => counts[option.key] || 0
              }
            end

            blank_count = { 'option_id' => '_blank', 'option' => 'unknown', 'users' => counts['_blank'] }
            res.push(blank_count)

            xlsx = XlsxService.new.generate_res_stats_xlsx(res, 'users', 'option')
          else
            xlsx = XlsxService.new.generate_field_stats_xlsx(counts, custom_field.key, 'users')
          end

          send_data(xlsx, type: XLSX_MIME_TYPE, filename: filename(custom_field))
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_domicile
          areas = Area.all.select(:id, :title_multiloc)
          render json: { series: { users: user_counts }, areas: areas.to_h { |a| [a.id, a.attributes.except('id')] } }
        end

        def users_by_domicile_as_xlsx
          counts = user_counts

          res = Area.all.map do |area|
            {
              'area_id' => area.id,
              'area' => MultilocService.new.t(area.title_multiloc),
              'users' => counts.fetch(area.id, 0)
            }
          end

          res.push(
            'area_id' => '_blank',
            'area' => 'unknown',
            'users' => counts['_blank']
          )

          xlsx = XlsxService.new.generate_res_stats_xlsx(res, 'users', 'area')
          send_data(xlsx, type: XLSX_MIME_TYPE, filename: filename(custom_field))
        end

        private

        def custom_field
          @custom_field ||=
            if params[:custom_field_id]
                              CustomField.find(params[:custom_field_id])
            elsif (key = custom_field_key_from_path)
                              CustomField.find_by(key: key)
            else
                              raise ActiveRecord::RecordNotFound
            end
        end

        def custom_field_key_from_path
          request.path.split('/').last
                 .match(/^users_by_(?<key>gender|education|birthyear|domicile)/)[:key]
        end

        def user_counts
          count_users_by_custom_field(find_users, custom_field)
        end

        def count_users_by_custom_field(users, custom_field)
          field_values = select_field_values(users, custom_field)

          # Warning: The method +count+ cannot be used here because it introduces a SQL syntax
          # error while rewriting the SELECT clause. This is because the 'field_value' column is a
          # computed column and it does not seem to be supported properly by the +count+ method.
          counts = field_values.order('field_value')
                               .group('field_value')
                               .select('COUNT(*) as count')
                               .to_a.pluck(:field_value, :count).to_h

          counts['_blank'] = counts.delete(nil) || 0
          counts
        end

        # Returns an ActiveRecord::Relation of all the custom field values for the given users.
        # It returns a view (result set) with a single column named 'field_value'. Essentially,
        # something that looks like:
        #   SELECT ... AS field_value FROM ...
        #
        # Each user results in one or multiple rows, depending on the type of custom field.
        # Custom fields with multiple values (e.g. multiselect) are returned as multiple rows.
        # If the custom field has no value for a given user, the resulting row contains NULL.
        def select_field_values(users, custom_field)
          case custom_field.input_type
          when 'select', 'checkbox', 'number'
            users.select("custom_field_values->'#{custom_field.key}' as field_value")
          when 'multiselect'
            users.joins(<<~SQL.squish).select('cfv.field_value as field_value')
              LEFT JOIN (
                SELECT
                  jsonb_array_elements(custom_field_values->'#{custom_field.key}') as field_value,
                  id as user_id
                FROM users
              ) as cfv
              ON users.id = cfv.user_id
            SQL
          else
            raise NotSupportedFieldTypeError
          end
        end

        def do_authorize
          authorize(:'user_custom_fields/stat_user')
        end

        def find_users
          users = policy_scope(User.active, policy_scope_class: StatUserPolicy::Scope)
                    .where(registration_completed_at: @start_at..@end_at)

          if params[:group]
            group = Group.find(params[:group])
            users = users.merge(group.members)
          end

          if params[:project]
            project = Project.find(params[:project])
            participants = ParticipantsService.new.project_participants(project)
            users = users.where(id: participants)
          end

          users
        end

        def filename(custom_field)
          "users_by_#{custom_field.key}.xlsx"
        end

        class NotSupportedFieldTypeError < StandardError; end
      end
    end
  end
end
