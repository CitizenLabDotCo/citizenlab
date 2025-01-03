# frozen_string_literal: true

module MachineTranslations
  module WebApi
    module V1
      class MachineTranslationsController < ApplicationController
        skip_before_action :authenticate_user

        CONSTANTIZER = {
          'Idea' => {
            translatable_class: Idea,
            translatable_id: :idea_id
          },
          'Comment' => {
            translatable_class: Comment,
            translatable_id: :comment_id
          }
        }

        def show
          require_feature! 'machine_translations'

          set_translation_attributes
          @translation = MachineTranslation.find_by @translation_attributes

          # create translation if it doesn't exist
          if @translation
            authorize @translation
          else
            begin
              @translation = MachineTranslationService.new.build_translation_for(**@translation_attributes)

              if @translation.nil?
                render json: { errors: { base: [{ error: 'unable_to_translate' }] } }, status: :unprocessable_entity
                skip_authorization
                return
              end

              authorize @translation
            rescue ClErrors::TransactionError => e
              raise e unless e.error_key == :translatable_blank

              render json: { errors: { base: [{ error: 'translatable_blank' }] } }, status: :unprocessable_entity
              return
            end
            unless @translation.save
              render json: { errors: @translation.errors.details }, status: :unprocessable_entity
              return
            end
          end

          # update translation if the original text may have changed
          if @translation.updated_at < @translation.translatable.updated_at
            MachineTranslationService.new.assign_new_translation @translation
            authorize @translation
            unless @translation.save
              render json: { errors: @translation.errors.details }, status: :unprocessable_entity
              return
            end
          end

          render json: ::WebApi::V1::MachineTranslationSerializer.new(
            @translation,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        private

        def set_translation_attributes
          translatable_id = params[secure_constantize(:translatable_id)]
          @translation_attributes = {
            translatable: secure_constantize(:translatable_class).find(translatable_id)
          }.merge params.require(:machine_translation).permit(:attribute_name, :locale_to).to_h.symbolize_keys
        end

        def secure_constantize(key)
          CONSTANTIZER.fetch(params[:translatable_type])[key]
        end
      end
    end
  end
end
