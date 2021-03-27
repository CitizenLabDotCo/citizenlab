module AdminApi
  class Types::PageType < GraphQL::Schema::Object
    description "An information page, maintained by the city"

    class PagePublicationStatus < GraphQL::Schema::Enum
      Page::PUBLICATION_STATUSES.each do |ps|
        value ps
      end
    end

    field :id, ID, null: false
    field :title_multiloc, Types::MultilocType, null: false
    field :body_multiloc, Types::MultilocType, null: false
    field :slug, String, null: false
    field :publication_status, PagePublicationStatus, null: false
    field :updated_at, String, null: false
    field :created_at, String, null: false
    field :href, String, null: true

    @@frontend_service = Frontend::UrlService.new
    def href
      @@frontend_service.model_to_url(object)
    end

  end
end