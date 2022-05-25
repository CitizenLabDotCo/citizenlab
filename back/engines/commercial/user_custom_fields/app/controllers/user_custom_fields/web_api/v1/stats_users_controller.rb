# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class StatsUsersController < ::WebApi::V1::StatsController
        XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        private_constant :XLSX_MIME_TYPE

        def users_by_gender
          render json: { series: { users: user_counts } }
        end

        def users_by_gender_as_xlsx
          xlsx = XlsxService.new.generate_field_stats_xlsx user_counts, 'gender', 'users'
          send_data xlsx, type: XLSX_MIME_TYPE, filename: 'users_by_gender.xlsx'
        end

        def users_by_birthyear
          render json: { series: { users: user_counts } }
        end

        def users_by_birthyear_as_xlsx
          xlsx = XlsxService.new.generate_field_stats_xlsx user_counts, 'birthyear', 'users'
          send_data xlsx, type: XLSX_MIME_TYPE, filename: 'users_by_birthyear.xlsx'
        end

        def users_by_domicile
          areas = Area.all.select(:id, :title_multiloc)
          render json: { series: { users: user_counts }, areas: areas.map { |a| [a.id, a.attributes.except('id')] }.to_h }
        end

        def users_by_domicile_as_xlsx
          serie = user_counts
          res = Area.all.map do |area|
            {
              'area_id' => area.id,
              'area' => multiloc_service.t(area.title_multiloc),
              'users' => serie.find { |entry| entry[0] == area.id }&.at(1) || 0
            }
          end
          unless serie.empty?
            res.push({
              'area_id' => '_blank',
              'area' => 'unknown',
              'users' => serie.delete(nil) || 0
            })
          end

          xlsx = XlsxService.new.generate_res_stats_xlsx res, 'users', 'area'
          send_data xlsx, type: XLSX_MIME_TYPE, filename: 'users_by_domicile.xlsx'
        end

        def users_by_education
          render json: { series: { users: user_counts } }
        end

        def users_by_education_as_xlsx
          xlsx = XlsxService.new.generate_field_stats_xlsx user_counts, 'education', 'users'
          send_data xlsx, type: XLSX_MIME_TYPE, filename: 'users_by_education.xlsx'
        end

        def users_by_custom_field
          user_counts = count_users_by_custom_field(find_users, custom_field)
          if %w[select multiselect].include?(custom_field.input_type)
            options = custom_field.custom_field_options.select(:key, :title_multiloc)
            render json: { series: { users: user_counts }, options: options.map { |o| [o.key, o.attributes.except('key', 'id')] }.to_h }
          else
            render json: { series: { users: user_counts } }
          end
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_custom_field_as_xlsx
          user_counts = count_users_by_custom_field(find_users, custom_field)

          if %w[select multiselect].include?(custom_field.input_type)
            options = custom_field.custom_field_options.select(:key, :title_multiloc)

            res = options.map do |option|
              {
                'option_id' => option.key,
                'option' => multiloc_service.t(option.title_multiloc),
                'users' => user_counts[option.key] || 0
              }
            end
            res.push({
              'option_id' => '_blank',
              'option' => 'unknown',
              'users' => user_counts['_blank'] || 0
            })
            xlsx = XlsxService.new.generate_res_stats_xlsx res, 'users', 'option'
          else
            xlsx = XlsxService.new.generate_field_stats_xlsx user_counts, 'option', 'users'
          end
          send_data xlsx, type: XLSX_MIME_TYPE, filename: 'users_by_custom_field.xlsx'
        rescue NotSupportedFieldTypeError
          head :not_implemented
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
          authorize :'user_custom_fields/stat_user'
        end

        def multiloc_service
          @multiloc_service ||= MultilocService.new
        end

        def find_users
          users = StatUserPolicy::Scope.new(current_user, User.active)
                                       .resolve
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

        class NotSupportedFieldTypeError < StandardError; end
      end
    end
  end
end
