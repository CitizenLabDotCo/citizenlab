module AdminApi
  class Types::MultilocType < GraphQL::Schema::Object

    CL2_SUPPORTED_LOCALES.each do |loc|
      field_name = loc.to_s.gsub(/-/, '_')
      field field_name, String, null: true, resolve: ->(obj, args, ctx) { obj[loc.to_s] }
    end

  end
end