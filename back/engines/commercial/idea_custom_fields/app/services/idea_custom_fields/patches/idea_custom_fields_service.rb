module IdeaCustomFields
  module Patches
    module IdeaCustomFieldsService

      def all_fields(custom_form, custom_fields_scope: nil, filter_invisible_fields: false)
        custom_and_default_fields(custom_form, custom_fields_scope: custom_fields_scope, filter_invisible_fields: filter_invisible_fields)
      end

      def find_or_build_field custom_form, code
        custom_form&.custom_fields&.find_by(code: code) ||
          default_fields(custom_form).find { |bicf| bicf.code == code }
      end

      private

      def custom_and_default_fields(custom_form, custom_fields_scope: nil, filter_invisible_fields: false)
        db_cfs = custom_form.custom_fields
        db_cfs = db_cfs.where.not(input_type: 'point') if filter_invisible_fields
        db_cfs = db_cfs.merge(custom_fields_scope) if custom_fields_scope

        bi_cfs = default_fields(custom_form)
        bi_cfs = bi_cfs.filter{ |cf| cf.input_type != 'point' } if filter_invisible_fields
        bi_codes = bi_cfs.map(&:code)

        # debugger

        replacing, additional = db_cfs.partition{|c| bi_codes.include? c.code}

        [
          *bi_cfs.map do |bi_cf|
            replacing.find{|c| bi_cf.code == c.code} || bi_cf
          end,
          *additional
        ]
      end
    end
  end
end
