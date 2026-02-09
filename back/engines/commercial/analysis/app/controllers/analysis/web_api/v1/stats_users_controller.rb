# frozen_string_literal: true

module Analysis
  module WebApi
    module V1
      class StatsUsersController < ApplicationController
        include FilterParamsExtraction

        skip_after_action :verify_policy_scoped # The analysis is authorized instead.
        before_action :set_analysis

        def authors_by_age
          age_stats = UserCustomFields::AgeStats.calculate(find_users)

          render json: raw_json({
            unknown_age_count: age_stats.unknown_age_count,
            series: {
              user_counts: age_stats.binned_counts,
              bins: age_stats.bins
            }
          })
        end

        def authors_by_domicile
          domicile_field = CustomField.registration.find_by!(code: 'domicile')

          users_count_by_option_id = UserCustomFields::FieldValueCounter.counts_by_field_option(
            find_users, domicile_field, by: :option_id
          )
          render json: raw_json({
            series: { users: users_count_by_option_id }
          })
        end

        def authors_by_custom_field
          json_response = { series: {
            users: user_counts
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

        private

        def set_analysis
          @analysis = Analysis.find(params[:analysis_id])
          authorize(@analysis, :show?)
        end

        def custom_field
          @custom_field ||= CustomField.find(params[:custom_field_id])
        end

        def user_counts
          @user_counts ||= UserCustomFields::FieldValueCounter.counts_by_field_option(find_users, custom_field)
        end

        def find_users
          inputs = InputsFinder.new(@analysis, filters(params)).execute
          User.where(id: inputs.select(:author_id))
        end

        class NotSupportedFieldTypeError < StandardError; end
      end
    end
  end
end
