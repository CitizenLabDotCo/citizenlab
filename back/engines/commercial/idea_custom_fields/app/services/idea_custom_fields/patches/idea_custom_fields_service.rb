module IdeaCustomFields
  module Patches
    module IdeaCustomFieldsService
      def all_fields(custom_form, custom_fields_scope: nil, filter_unmodifiable: false)
        custom_and_default_fields(custom_form, custom_fields_scope: custom_fields_scope, filter_unmodifiable: filter_unmodifiable)
      end

      def find_or_build_field(custom_form, code)
        custom_form&.custom_fields&.find_by(code: code) ||
          default_fields(custom_form).find { |bicf| bicf.code == code }
      end

      private

      def custom_and_default_fields(custom_form, custom_fields_scope: nil, filter_unmodifiable: false)
        # Some fields exist but should not be shown in the input form settings, and we filter them here when the filter_unmodifiable flag is true
        db_cfs = custom_form.custom_fields
        db_cfs = db_cfs.where.not(code: %w[location_point_geojson author_id budget]).or(db_cfs.where(code: nil)) if filter_unmodifiable
        db_cfs = db_cfs.merge(custom_fields_scope) if custom_fields_scope

        bi_cfs = default_fields(custom_form)
        bi_cfs = bi_cfs.filter { |cf| cf.code != 'location_point_geojson' && cf.code != 'author_id' && cf.code != 'budget' } if filter_unmodifiable
        bi_codes = bi_cfs.map(&:code)

        replacing, additional = db_cfs.partition { |c| bi_codes.include? c.code }

        [
          *bi_cfs.map do |bi_cf|
            replacing.find { |c| bi_cf.code == c.code } || bi_cf
          end,
          *additional
        ]
      end
    end
  end
end
