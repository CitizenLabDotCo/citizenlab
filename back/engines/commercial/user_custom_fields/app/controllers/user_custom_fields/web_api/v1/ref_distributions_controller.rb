# frozen_string_literal: true

module UserCustomFields
  module WebApi::V1
    class RefDistributionsController < ::ApplicationController
      def show
        render json: serialize(reference_distribution)
      end

      def create
        ref_distribution = authorize(Representativeness::RefDistribution.new(create_params))

        Representativeness::RefDistribution.transaction do
          remove_reference_distribution_if_any(params[:custom_field_id])
          ref_distribution.save!
        end

        side_fx.after_create(ref_distribution, current_user)
        render json: serialize(ref_distribution), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def destroy
        reference_distribution.destroy!
        side_fx.after_destroy(reference_distribution, current_user)
        head :no_content
      end

      private

      def remove_reference_distribution_if_any(custom_field_id)
        Representativeness::RefDistribution.where(
          custom_field_id: custom_field_id
        ).destroy_all
      end

      def side_fx
        Representativeness::SideFxRefDistributionService.new
      end

      def reference_distribution
        @reference_distribution ||= authorize(
          Representativeness::RefDistribution
            .includes(:values)
            .find_by!(custom_field_id: params[:custom_field_id])
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
