module AdminApi
  class Types::ProjectFolderType < GraphQL::Schema::Object
    description "A city defined scope to constrain the citizen input received"

    class ProjectFolderPublicationStatus < GraphQL::Schema::Enum
      AdminPublication::PUBLICATION_STATUSES.each do |ps|
        value ps
      end
    end

    field :id, ID, null: false
    field :title_multiloc, Types::MultilocType, null: false
    field :slug, String, null: false
    field :publication_status, ProjectFolderPublicationStatus, null: false
    def publication_status
      object.admin_publication.publication_status
    end
    field :updated_at, String, null: false
    field :created_at, String, null: false
    field :href, String, null: true

    @@frontend_service = Frontend::UrlService.new
    def href
      @@frontend_service.model_to_url(object)
    end

  end
end