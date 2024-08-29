# frozen_string_literal: true

module AdminApi
  class Types::MultilocType < GraphQL::Schema::Object
    CL2_SUPPORTED_LOCALES.each do |loc|
      field_name = loc.to_s.tr('-', '_')
      field field_name, String, null: true

      define_method field_name do
        object[loc.to_s]
      end
    end
  end
end
