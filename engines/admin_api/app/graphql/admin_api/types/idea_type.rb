module AdminApi
  class Types::IdeaType < GraphQL::Schema::Object
    description "Single unit of citizen input"

    class IdeaPublicationStatus < GraphQL::Schema::Enum
      Idea::PUBLICATION_STATUSES.each do |ps|
        value ps
      end
    end


    field :id, ID, null: false
    field :title_multiloc, Types::MultilocType, null: false
    field :slug, String, null: false
    field :publication_status, IdeaPublicationStatus, null: false
    field :updated_at, String, null: false
    field :created_at, String, null: false
    field :published_at, String, null: false
    field :href, String, null: true

    @@frontend_service = FrontendService.new
    def href
      @@frontend_service.model_to_url(object)
    end

  end
end