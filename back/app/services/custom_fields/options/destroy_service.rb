module CustomFields
  module Options
    class DestroyService
      include SideFxHelper

      def destroy!(option, user = nil)
        ActiveRecord::Base.transaction do
          update_custom_field_values(option)
          option.destroy!
          update_form_logic(option)
        end

        log_destroy_activity(option, user)
        option
      end

      def destroy(option, user = nil)
        destroy!(option, user)
      rescue ActiveRecord::RecordNotDestroyed
        option
      end

      private

      def update_custom_field_values(option)
        cf = option.custom_field

        if cf.resource_type == 'User'
          UserCustomFieldService.new.delete_custom_field_option_values(option.key, cf)
        elsif cf.resource_type == 'CustomForm'
          delete_ranking_option_from_ideas(option) if cf.input_type == 'ranking'
        end
      end

      def update_form_logic(option)
        cf = option.custom_field

        if cf.resource_type == 'CustomForm' && cf.input_type == 'select'
          FormLogicService.new([cf]).remove_select_logic_option_from_custom_fields(option)
        end
      end

      def delete_ranking_option_from_ideas(option)
        field_key = option.custom_field.key

        ideas = ::Idea.where(
          'custom_field_values -> :field_key ? :option_key',
          field_key: field_key,
          option_key: option.key
        )

        ideas.update_all(<<~SQL.squish)
          custom_field_values = jsonb_set(
            custom_field_values,
            '{#{field_key}}',
            (custom_field_values -> '#{field_key}') - '#{option.key}'
          )
        SQL
      end

      def log_destroy_activity(option, user)
        serialized_option = clean_time_attributes(option.attributes)
        LogActivityJob.perform_later(
          encode_frozen_resource(option),
          'deleted',
          user,
          Time.now.to_i,
          payload: { custom_field_option: serialized_option }
        )
      end
    end
  end
end
