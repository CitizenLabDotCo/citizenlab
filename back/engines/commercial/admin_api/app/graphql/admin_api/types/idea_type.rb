module AdminApi
  class Types::IdeaType < GraphQL::Schema::Object
    description "Single unit of citizen input"

    class IdeaPublicationStatus < GraphQL::Schema::Enum
      Idea::PUBLICATION_STATUSES.each do |ps|
        value ps
      end
    end

    class IdeaImage < GraphQL::Schema::Object
      description "An image associates with an idea"

      field :id, ID, null: false
      field :ordering, Integer, null: true
      field :small_url, String, null: false
      def small_url
        object.image.versions[:small].url
      end
      field :medium_url, String, null: false
      def medium_url
        object.image.versions[:medium].url
      end
      field :large_url, String, null: false
      def large_url
        object.image.versions[:large].url
      end
      field :updated_at, String, null: false
      field :created_at, String, null: false
    end


    field :id, ID, null: false
    field :title_multiloc, Types::MultilocType, null: false
    field :body_multiloc, Types::MultilocType, null: false
    field :slug, String, null: false
    field :publication_status, IdeaPublicationStatus, null: false
    field :updated_at, String, null: false
    field :created_at, String, null: false
    field :published_at, String, null: false
    field :href, String, null: true
    field :upvotes_count, Integer, null: false
    field :downvotes_count, Integer, null: false
    field :comments_count, Integer, null: false
    field :images, IdeaImage.connection_type, null: true
    def images
      object.idea_images
    end

    def published_at
      object.published_at&.iso8601
    end


    @@frontend_service = Frontend::UrlService.new
    def href
      @@frontend_service.model_to_url(object)
    end

  end
end