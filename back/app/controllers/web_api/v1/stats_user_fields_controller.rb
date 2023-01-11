# frozen_string_literal: true

module WebApi
  module V1
    class StatsUserFieldsController < ::WebApi::V1::StatsController
      XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      private_constant :XLSX_MIME_TYPE

      def users_by_custom_field
        json_response = { series: {
          users: user_counts,
          expected_users: nil,
          reference_population: nil
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
        authorize(:stat_user_field)
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
        @user_counts ||= UserFields::FieldValueCounter.counts_by_field_option(find_users, custom_field)
      end

      def user_counts_by_area_id
        @user_counts_by_area_id ||= UserFields::FieldValueCounter.counts_by_field_option(
          find_users, custom_field, by: :area_id
        )
      end

      def find_users
        users = policy_scope(User.active, policy_scope_class: StatUserPolicy::Scope)
        finder_params = params.permit(:group, :project).merge(registration_date_range: @start_at..@end_at)
        UsersFinder.new(users, finder_params).execute
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
