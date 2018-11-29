module MachineTranslations
  class WebApi::V1::MachineTranslationsController < MachineTranslationsController

    def show
      translatable_type = params[:translatable]
      translatable_id = params[:"#{translatable_type.underscore}_id"]
      raise RuntimeError, "must not be blank" if translatable_type.blank? or translatable_id.blank?
      translation_params = params.require(:machine_translation).permit(
        :attribute_name,
        :locale_to,
      )
      translation_attributes = {
        translatable_type: translatable_type,
        translatable_id: translatable_id,
        attribute_name: translation_params[:attribute_name],
        locale_to: translation_params[:locale_to]
      }
      @translation = MachineTranslation.find_by translation_attributes
      if !@translation
        ActiveRecord::Base.transaction do
          @translation = MachineTranslationService.new.create_translation_for translation_attributes
          authorize @translation
        end
        SideFxMachineTranslationService.new.after_create @translation, current_user
      else
        authorize @translation
      end
      if @translation.updated_at < @translation.translatable.updated_at
        MachineTranslationService.new.update_translation @translation
        SideFxMachineTranslationService.new.after_update @translation, current_user
      end

      render json: @translation, serializer: WebApi::V1::MachineTranslationSerializer
    end

  end
end
