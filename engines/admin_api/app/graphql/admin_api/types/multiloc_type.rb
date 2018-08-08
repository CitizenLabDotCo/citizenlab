module AdminApi
  class Types::MultilocType < GraphQL::Schema::Object

    CL2_SUPPORTED_LOCALES.each do |loc|
      field loc.to_s.gsub(/-/, '_'), String, null: true
    end

  end
end