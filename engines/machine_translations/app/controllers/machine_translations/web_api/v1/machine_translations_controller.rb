module MachineTranslations
  module WebApi
    module V1
      class MachineTranslationsController < ApplicationController

        def show
          set_translation_attributes
          @translation = MachineTranslation.find_by @translation_attributes

          # create translation if it doesn't exist
          if !@translation
            begin
              @translation = MachineTranslationService.new.build_translation_for @translation_attributes
              authorize @translation
            rescue ClErrors::TransactionError => e
              if e.error_key == :translatable_blank
                render json: { errors: { base: [{ error: 'translatable_blank' }] } }, status: :unprocessable_entity
                return
              else
                raise e
              end
            end
            if !@translation.save
              render json: { errors: @translation.errors.details }, status: :unprocessable_entity
              return
            end
          else
            authorize @translation
          end
          
          # update translation if the original text may have changed
          if @translation.updated_at < @translation.translatable.updated_at
            MachineTranslationService.new.assign_new_translation @translation
            authorize @translation
            if !@translation.save
              render json: { errors: @translation.errors.details }, status: :unprocessable_entity
              return
            end
          end

          render json: WebApi::V1::MachineTranslationSerializer.new(
            @translation, 
            params: fastjson_params
            ).serialized_json
        end


        private

        def set_translation_attributes
          translatable_type = params[:translatable]
          translatable_id = params[:"#{translatable_type.underscore}_id"]
          raise RuntimeError, "must not be blank" if translatable_type.blank? or translatable_id.blank?

          translation_params = params.require(:machine_translation).permit(
            :attribute_name,
            :locale_to,
          )

          @translation_attributes = {
            translatable_type: translatable_type,
            translatable_id: translatable_id,
            attribute_name: translation_params[:attribute_name],
            locale_to: translation_params[:locale_to]
          }
        end

        def secure_controller?
          false
        end

      end
    end
  end
end
