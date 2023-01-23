# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CustomFields < Base
      def run
        custom_field = CustomField.create!(
          resource_type: 'User',
          key: 'politician',
          input_type: 'select',
          title_multiloc: { 'en' => 'Are you a politician?' },
          description_multiloc: { 'en' => 'We use this to provide you with customized information' },
          required: false
        )

        CustomFieldOption.create!(custom_field: custom_field, key: 'active_politician',
          title_multiloc: { 'en' => 'Active politician' })
        CustomFieldOption.create!(custom_field: custom_field, key: 'retired_politician',
          title_multiloc: { 'en' => 'Retired politician' })
        CustomFieldOption.create!(custom_field: custom_field, key: 'no', title_multiloc: { 'en' => 'No' })
      end
    end
  end
end
