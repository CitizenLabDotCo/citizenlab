# frozen_string_literal: true

module UserCustomFields
  module WebApi::V1
    class RefDistributionsController < ::ApplicationController
      def show
        ref_distribution = Representativeness::RefDistribution.find_by(custom_field_id: params[:custom_field_id])
        authorize(ref_distribution)
        render json: serialize(ref_distribution)
      end

      def create
        ref_distribution = authorize(Representativeness::RefDistribution.new(create_params))
        # TODO: side effects
        # TODO: error cases
        ref_distribution.save!
        render json: serialize(ref_distribution), status: :created
      end

      private

      def create_params
        params.permit(:custom_field_id, distribution: {})
      end

      def serialize(ref_distribution)
        RefDistributionSerializer.new(ref_distribution).serialized_json
      end
    end
  end
end
