# frozen_string_literal: true

module UserCustomFields
  module WebApi
    module V1
      class RScoresController < ::ApplicationController
        def show
          authorize %i[user_custom_fields representativeness r_score]
          ref_distribution = user_custom_field.current_ref_distribution
          return render status: :method_not_allowed if ref_distribution.blank?

          r_score = ref_distribution.compute_rscore(find_users)
          render json: RScoreSerializer.new(r_score, include: [:reference_distribution]).serializable_hash
        end

        private

        def find_users
          finder_params = params.permit(:project)
          UsersFinder.new(User.active, finder_params).execute
        end

        def user_custom_field
          @user_custom_field ||= CustomField.find(params[:custom_field_id])
        end
      end
    end
  end
end
