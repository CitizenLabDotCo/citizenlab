# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class StatsUsersController < ::WebApi::V1::StatsController
        XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        private_constant :XLSX_MIME_TYPE

        def users_by_age
          age_stats = AgeStats.calculate(find_users)

          render json: raw_json({
            total_user_count: age_stats.user_count,
            unknown_age_count: age_stats.unknown_age_count,
            series: {
              user_counts: age_stats.binned_counts,
              reference_population: age_stats.population_counts,
              bins: age_stats.bins
            }
          })
        end

        def users_by_age_as_xlsx
          age_stats = AgeStats.calculate(find_users)
          xlsx = Xlsx::AgeStatsSerializer.generate(age_stats)
          send_xlsx(xlsx, filename: 'users_by_age.xlsx')
        end

        def users_by_custom_field
          json_response = { series: {
            users: user_counts,
            reference_population: reference_population
          } }

          if custom_field.options.present?
            json_response[:options] = custom_field.options.to_h do |o|
              [o.key, o.attributes.slice('title_multiloc', 'ordering')]
            end
          end

          render json: raw_json(json_response)
        rescue NotSupportedFieldTypeError
          head :not_implemented
        end

        def users_by_custom_field_as_xlsx
          send_xlsx(users_by_custom_field_xlsx)
        rescue NotSupportedFieldTypeError
          head :not_implemented
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

        def find_users
          users = policy_scope(User.active, policy_scope_class: StatUserPolicy::Scope)
          finder_params = if params[:filter_by_participation]
            params.permit(:group, :project).merge(participation_date_range: { since: @start_at, to: @end_at })
          else
            params.permit(:group, :project).merge(registration_date_range: @start_at..@end_at)
          end
          UsersFinder.new(users, finder_params).execute
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
                cols[:reference_population] = reference_population.fetch_values(*option_ids) { nil } if reference_population.present?
              end
            else
              {
                option: user_counts.keys,
                users: user_counts.values
              }
            end

          # Remove option id from xlsx output - confusing for customers
          xlsx_columns.delete(:option_id)
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
