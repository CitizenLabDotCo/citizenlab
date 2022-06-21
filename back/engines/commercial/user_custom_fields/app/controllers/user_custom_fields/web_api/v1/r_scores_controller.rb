# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class RScoresController < ::ApplicationController
        def show
          authorize %i[user_custom_fields representativeness r_score]

          if (ref_distribution = user_custom_field.current_ref_distribution).present?
            user_counts = FieldValueCounter.counts_by_field_option(User.active, user_custom_field, by_option_id: true)
            r_score = Representativeness::RScore.compute(user_counts, ref_distribution)
            render json: RScoreSerializer.new(r_score).serialized_json
          else
            render status: :method_not_allowed
          end
        end

        def user_custom_field
          @user_custom_field ||= CustomField.find(params[:custom_field_id])
        end
      end
    end
  end
end
