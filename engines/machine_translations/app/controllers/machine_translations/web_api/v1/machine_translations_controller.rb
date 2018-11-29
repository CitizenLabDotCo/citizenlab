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
      tanslation_attributes = {
        translatable_type: translatable_type,
        translatable_id: translatable_id,
        attribute_name: translation_params[:attribute_name],
        locale_to: translation_params[:locale_to]
      }
      @translation = MachineTranslation.find_by tanslation_attributes
      if !@translation
        @translation = MachineTranslationService.new.create_translation_for tanslation_attributes
      end
      if @translation.updated_at < @translation.translatable.updated_at
        MachineTranslationService.new.update_translation @translation
      end

      authorize @translation

      render json: @translation, serializer: WebApi::V1::MachineTranslationSerializer
    end

  end
end
