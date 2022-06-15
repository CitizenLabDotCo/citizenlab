# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class StatsUsersController < ::WebApi::V1::StatsController
        XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        private_constant :XLSX_MIME_TYPE

        def users_by_custom_field
          json_response = { series: {
            users: user_counts,
            expected_users: expected_user_counts
          } }

          if custom_field.custom_field_options.present?
            json_response[:options] = custom_field.custom_field_options.to_h do |o|
              [o.key, o.attributes.slice('title_multiloc', 'ordering')]
            end
          end

          render json: json_response
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_custom_field_as_xlsx
          send_data(users_by_custom_field_xlsx, type: XLSX_MIME_TYPE, filename: xlsx_export_filename(custom_field))
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_domicile
          areas = Area.all.select(:id, :title_multiloc)
          render json: { series: { users: user_counts }, areas: areas.to_h { |a| [a.id, a.attributes.except('id')] } }
        end

        def users_by_domicile_as_xlsx
          res = Area.all.map do |area|
            {
              'area_id' => area.id,
              'area' => MultilocService.new.t(area.title_multiloc),
              'users' => user_counts.fetch(area.id, 0)
            }
          end

          res.push(
            'area_id' => '_blank',
            'area' => 'unknown',
            'users' => user_counts['_blank']
          )

          xlsx = XlsxService.new.generate_res_stats_xlsx(res, 'users', 'area')
          send_data(xlsx, type: XLSX_MIME_TYPE, filename: xlsx_export_filename(custom_field))
        end

        private

        def do_authorize
          authorize(:'user_custom_fields/stat_user')
        end

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
          request
            .path.split('/').last
            .match(/^users_by_(?<key>gender|education|birthyear|domicile)/)&.[](:key)
        end

        def user_counts
          @user_counts ||= FieldValueCounter.counts_by_field_option(find_users, custom_field)
        end

        def find_users
          users = policy_scope(User.active, policy_scope_class: StatUserPolicy::Scope)
          finder_params = params.permit(:group, :project).merge(registration_date_range: @start_at..@end_at)
          UsersFinder.new(users, finder_params).execute
        end

        def expected_user_counts
          @expected_user_counts ||=
            if (ref_distribution = custom_field.current_ref_distribution).present?

              nb_users_with_response = user_counts.values.sum - user_counts['_blank']
              expected_counts = ref_distribution.expected_counts(nb_users_with_response)

              option_id_to_key = custom_field.custom_field_options.to_h { |option| [option.id, option.key] }
              expected_counts.transform_keys { |option_id| option_id_to_key[option_id] }
            end
        end

        def users_by_custom_field_xlsx
          xlsx_columns =
            if (options = custom_field.custom_field_options).present?
              {
                option: localized_option_titles(options) << '_blank',
                option_id: options.pluck(:key) << '_blank'
              }.tap do |cols|
                cols[:users] = user_counts.fetch_values(*cols[:option_id]) { 0 }
                if expected_user_counts.present?
                  cols[:expected_users] = expected_user_counts.fetch_values(*cols[:option_id]) { 0 }
                end
              end
            else
              {
                option: user_counts.keys,
                users: user_counts.values
              }
            end

          XlsxService.new.xlsx_from_columns(xlsx_columns, sheetname: "users_by_#{custom_field.key}")
        end

        def localized_option_titles(options)
          options.map { |o| MultilocService.new.t(o.title_multiloc) }
        end

        def xlsx_export_filename(custom_field)
          "users_by_#{custom_field.key}.xlsx"
        end

        class NotSupportedFieldTypeError < StandardError; end
      end
    end
  end
end
