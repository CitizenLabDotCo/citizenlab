# frozen_string_literal: true

module AdminApi
  class Types::PageType < GraphQL::Schema::Object
    description 'An information page, maintained by the city'

    field :id, ID, null: false
    field :title_multiloc, Types::MultilocType, null: false
    field :top_info_section_multiloc, Types::MultilocType, null: false
    field :slug, String, null: false
    field :updated_at, String, null: false
    field :created_at, String, null: false
    field :href, String, null: true

    def href
      Frontend::UrlService.new.model_to_url(object)
    end
  end
end
