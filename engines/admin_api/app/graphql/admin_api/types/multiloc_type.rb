module AdminApi
  class Types::MultilocType < GraphQL::Schema::Object

    I18n.available_locales.each do |loc|
      field loc.to_s.gsub(/-/, '_'), String, null: true
    end

  end
end