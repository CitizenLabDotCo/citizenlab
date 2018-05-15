module AdminApi
  class Types::MultilocType < GraphQL::Schema::Object

    I18n.available_locales.each do |loc|
      field loc, String, null: true
    end

  end
end