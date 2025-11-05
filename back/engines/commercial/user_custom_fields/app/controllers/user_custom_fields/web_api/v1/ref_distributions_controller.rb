# frozen_string_literal: true

module UserCustomFields
  module WebApi::V1
    class RefDistributionsController < ::ApplicationController
      # Shortcuts for long namespace
      RefDistribution = Representativeness::RefDistribution
      CategoricalDistribution = Representativeness::CategoricalDistribution
      private_constant :RefDistribution, :CategoricalDistribution

      def show
        render json: serialize(reference_distribution)
      end

      def create
        ref_distribution = authorize(RefDistribution.new(create_params))

        RefDistribution.transaction do
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
        RefDistribution
          .where(custom_field_id: custom_field_id)
          .destroy_all
      end

      def side_fx
        @side_fx ||= Representativeness::SideFxRefDistributionService.new
      end

      def reference_distribution
        @reference_distribution ||= authorize(
          RefDistribution.find_by!(custom_field_id: params[:custom_field_id])
        )
      end

      def create_params
        params
          .permit(:custom_field_id, distribution: {})
          .merge(type: infer_ref_distribution_type)
      end

      def infer_ref_distribution_type
        custom_field = CustomField.find(params[:custom_field_id])
        if custom_field.key == 'birthyear'
          UserCustomFields::Representativeness::BinnedDistribution.name
        elsif custom_field.input_type == 'select'
          'UserCustomFields::Representativeness::CategoricalDistribution'
        else
          raise 'Unsupported custom field type.'
        end
      end

      def serialize(ref_distribution)
        serializer_class = identify_serializer_class(ref_distribution)
        serializer_class.new(ref_distribution).serializable_hash.to_json
      end

      def identify_serializer_class(ref_distribution)
        "UserCustomFields::WebApi::V1::#{ref_distribution.class.name.demodulize}Serializer".constantize
      end
    end
  end
end
