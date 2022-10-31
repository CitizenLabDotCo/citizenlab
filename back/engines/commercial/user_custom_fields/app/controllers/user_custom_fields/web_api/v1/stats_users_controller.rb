# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class StatsUsersController < ::WebApi::V1::StatsController
        XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        private_constant :XLSX_MIME_TYPE

        def users_by_age
          age_stats = AgeStats.calculate(find_users)
          render json: age_stats, serializer: AgeStatsSerializer, adapter: :attributes
        end

        def users_by_age_as_xlsx
          age_stats = AgeStats.calculate(find_users)
          xlsx = Xlsx::AgeStatsSerializer.generate(age_stats)
          send_xlsx(xlsx, filename: 'users_by_age.xlsx')
        end

        def users_by_custom_field
          json_response = { series: {
            users: user_counts,
            expected_users: expected_user_counts,
            reference_population: reference_population
          } }

          if custom_field.options.present?
            json_response[:options] = custom_field.options.to_h do |o|
              [o.key, o.attributes.slice('title_multiloc', 'ordering')]
            end
          end

          render json: json_response
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_custom_field_as_xlsx
          send_xlsx(users_by_custom_field_xlsx)
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_domicile
          areas = Area.all.select(:id, :title_multiloc)
          render json: {
            series: { users: user_counts_by_area_id },
            areas: areas.to_h { |a| [a.id, a.attributes.except('id')] }
          }
        end

        def users_by_domicile_as_xlsx
          res = Area.all.map do |area|
            {
              'area_id' => area.id,
              'area' => MultilocService.new.t(area.title_multiloc),
              'users' => user_counts_by_area_id.fetch(area.id, 0)
            }
          end

          res.push(
            'area_id' => '_blank',
            'area' => 'unknown',
            'users' => user_counts_by_area_id['_blank']
          )

          xlsx = XlsxService.new.generate_res_stats_xlsx(res, 'users', 'area')
          send_xlsx(xlsx)
        end

        private

        def do_authorize
          authorize(:'user_custom_fields/stat_user')
        end

        def custom_field
          @custom_field ||=
            if (key = custom_field_key_from_path)
              CustomField.find_by(key: key)
            elsif params[:custom_field_id]
              CustomField.find(params[:custom_field_id])
            else
              raise ActiveRecord::RecordNotFound
            end
        end

        def custom_field_key_from_path
          key = request
            .path.split('/').last
            .match(/^users_by_(?<key>age|birthyear|domicile|education|gender)/)&.[](:key)

          key == 'age' ? 'birthyear' : key
        end

        def user_counts
          @user_counts ||= FieldValueCounter.counts_by_field_option(find_users, custom_field)
        end

        def user_counts_by_area_id
          @user_counts_by_area_id ||= FieldValueCounter.counts_by_field_option(
            find_users, custom_field, by: :area_id
          )
        end

        def find_users
          users = policy_scope(User.active, policy_scope_class: StatUserPolicy::Scope)
          finder_params = params.permit(:group, :project).merge(registration_date_range: @start_at..@end_at)
          UsersFinder.new(users, finder_params).execute
        end

        def expected_user_counts
          @expected_user_counts ||= calculate_expected_user_counts
        end

        def calculate_expected_user_counts
          return if custom_field.key == 'birthyear'
          return if (ref_distribution = custom_field.current_ref_distribution).blank?

          # user counts for toggled off options are not used to calculate expected user counts
          toggled_on_option_keys = ref_distribution.distribution_by_option_key.keys
          nb_users_to_redistribute = user_counts.slice(*toggled_on_option_keys).values.sum
          expected_counts = ref_distribution.expected_counts(nb_users_to_redistribute)

          option_id_to_key = custom_field.options.to_h { |option| [option.id, option.key] }
          expected_counts.transform_keys { |option_id| option_id_to_key.fetch(option_id) }
        end

        def reference_population
          @reference_population ||= calculate_reference_population
        end

        def calculate_reference_population
          return if custom_field.key == 'birthyear'
          return if (ref_distribution = custom_field.current_ref_distribution).blank?

          ref_distribution.distribution_by_option_key
        end

        def users_by_custom_field_xlsx
          xlsx_columns =
            if (options = custom_field.options).present?
              {
                option: localized_option_titles(options) << '_blank',
                option_id: options.pluck(:key) << '_blank'
              }.tap do |cols|
                option_ids = cols[:option_id]
                cols[:users] = user_counts.fetch_values(*option_ids) { 0 }
                cols[:expected_users] = expected_user_counts.fetch_values(*option_ids) { nil } if expected_user_counts.present?
                cols[:reference_population] = reference_population.fetch_values(*option_ids) { nil } if reference_population.present?
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

        def send_xlsx(xlsx, filename: nil)
          filename ||= xlsx_export_filename(custom_field)
          send_data(xlsx, type: XLSX_MIME_TYPE, filename: filename)
        end

        def xlsx_export_filename(custom_field)
          "users_by_#{custom_field.key}.xlsx"
        end

        class NotSupportedFieldTypeError < StandardError; end
      end
    end
  end
end
