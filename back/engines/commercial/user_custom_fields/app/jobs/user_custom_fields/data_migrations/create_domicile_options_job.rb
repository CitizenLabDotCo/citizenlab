# frozen_string_literal: true

module UserCustomFields
  module DataMigrations
    class CreateDomicileOptionsJob < ApplicationJob
      perform_retries false
      self.priority = 10

      class CreateDomicileOptionsJobAborted < RuntimeError; end

      # rubocop:disable Rails/ApplicationRecord
      class CustomField < ActiveRecord::Base
        self.table_name = 'custom_fields'
      end

      class CustomFieldOption < ActiveRecord::Base
        self.table_name = 'custom_field_options'

        has_one :area, dependent: :nullify
        belongs_to :custom_field
      end

      class Area < ActiveRecord::Base
        self.table_name = 'areas'
      end
      # rubocop:enable Rails/ApplicationRecord

      def perform
        return unless domicile_custom_field

        nb_options = CustomFieldOption.where(custom_field_id: domicile_custom_field.id).count
        return if nb_options == Area.count + 1

        # +1 accounts for the "somewhere else" option
        raise <<~MSG.squish if nb_options > 0 && nb_options != Area.count + 1
          The number of options (#{nb_options}) for the domicile custom field does not
          match the number of areas (#{Area.count}).
        MSG

        create_domicile_options
      rescue StandardError
        raise CreateDomicileOptionsJobAborted
      end

      private

      def domicile_custom_field
        @domicile_custom_field ||= CustomField.find_by(code: 'domicile')
      end

      def create_domicile_options
        CustomFieldOption.transaction do
          Area.all.each do |area|
            option = create_domicile_option(generate_key(area), area.title_multiloc, area.ordering)
            update_area_foreign_key(area.id, option.id)
          end

          create_somewhere_else_option(Area.count)
        end
      end

      def create_domicile_option(key, title_multiloc, ordering)
        CustomFieldOption.create(
          custom_field: domicile_custom_field,
          key: key,
          title_multiloc: title_multiloc,
          ordering: ordering
        )
      end

      def create_somewhere_else_option(ordering)
        key = "area-#{ordering}-somewhere_else"
        title_multiloc = CL2_SUPPORTED_LOCALES.index_with do |locale|
          I18n.t('custom_field_options.domicile.outside', locale: locale)
        end.compact

        create_domicile_option(key, title_multiloc, ordering)
      end

      def update_area_foreign_key(area_id, option_id)
        Area.find(area_id).update(custom_field_option_id: option_id)
      end

      def generate_key(area)
        area_name = ::Utils.snakecase(area.title_multiloc.values.first.parameterize)
        "area-#{area.ordering}-#{area_name}"
      end
    end
  end
end
