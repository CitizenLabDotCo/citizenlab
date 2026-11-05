# frozen_string_literal: true

module MachineTranslations
  module WebApi
    module V1
      class MachineTranslationsController < ApplicationController
        skip_before_action :authenticate_user, only: :show

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
            @translation = MachineTranslationService.new.build_translation_for(**@translation_attributes)

            if @translation.nil?
              render json: { errors: { base: [{ error: 'unable_to_translate' }] } }, status: :unprocessable_entity
              skip_authorization
              return
            end

            authorize @translation
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

        # Translates the source locale of a multiloc into the target locales. Used to fill the empty
        # locales of admin content. Nothing is stored.
        def translate_multiloc
          require_feature! 'machine_translations'
          authorize MachineTranslation, :translate_multiloc?

          tenant_locales = AppConfiguration.instance.settings('core', 'locales')
          translate_params = params.require(:machine_translation).permit(:source_locale, :html, target_locales: [], multiloc: {})
          source_locale = translate_params[:source_locale]
          source_text = translate_params.dig(:multiloc, source_locale)
          target_locales = Array(translate_params[:target_locales]).uniq - [source_locale]

          if tenant_locales.exclude?(source_locale) || source_text.blank? || target_locales.empty? || (target_locales - tenant_locales).any?
            render json: { errors: { base: [{ error: 'invalid_locales' }] } }, status: :unprocessable_entity
            return
          end

          html = ActiveModel::Type::Boolean.new.cast(translate_params[:html])
          translations = translate_to_locales(source_text, source_locale, target_locales, html)
          if translations
            render json: { data: { type: 'multiloc_translation', attributes: { multiloc: translations } } }
          else
            render json: { errors: { base: [{ error: 'unable_to_translate' }] } }, status: :unprocessable_entity
          end
        end

        private

        def set_translation_attributes
          translatable_id = params[secure_constantize(:translatable_id)]
          @translation_attributes = {
            translatable: secure_constantize(:translatable_class).find(translatable_id)
          }.merge params.require(:machine_translation).permit(:attribute_name, :locale_to).to_h.symbolize_keys
        end

        def translate_to_locales(text, source_locale, target_locales, html)
          LLMTranslator.new.translate_to_locales(text, source_locale, target_locales, html: html)
        rescue StandardError => e
          ErrorReporter.report(e)
          nil
        end

        def secure_constantize(key)
          CONSTANTIZER.fetch(params[:translatable_type])[key]
        end
      end
    end
  end
end
