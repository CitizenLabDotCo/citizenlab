# frozen_string_literal: true

module UserCustomFields
  module WebApi::V1
    class RefDistributionsController < ::ApplicationController
      def show
        render json: serialize(reference_distribution)
      end

      def create
        ref_distribution = authorize(Representativeness::RefDistribution.new(create_params))
        # TODO: side effects
        # TODO: error cases
        ref_distribution.save!
        render json: serialize(ref_distribution), status: :created
      end

      def destroy
        reference_distribution.destroy!
        head :no_content
      end

      private

      def reference_distribution
        @reference_distribution ||= authorize(
          Representativeness::RefDistribution.find_by!(custom_field_id: params[:custom_field_id])
        )
      end

      def create_params
        params.permit(:custom_field_id, distribution: {})
      end

      def serialize(ref_distribution)
        RefDistributionSerializer.new(ref_distribution).serialized_json
      end
    end
  end
end
