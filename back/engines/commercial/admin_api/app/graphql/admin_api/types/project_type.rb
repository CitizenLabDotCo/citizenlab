module AdminApi
  class Types::ProjectType < GraphQL::Schema::Object
    description "A city defined scope to constrain the citizen input received"

    class ProjectPublicationStatus < GraphQL::Schema::Enum
      AdminPublication::PUBLICATION_STATUSES.each do |ps|
        value ps
      end
    end

    class ProjectVisibleTo < GraphQL::Schema::Enum
      Project::VISIBLE_TOS.each do |ps|
        value ps
      end
    end

    class ProjectProcessType < GraphQL::Schema::Enum
      Project::PROCESS_TYPES.each do |pt|
        value pt
      end
    end

    field :id, ID, null: false
    field :title_multiloc, Types::MultilocType, null: false
    field :slug, String, null: false
    field :publication_status, ProjectPublicationStatus, null: false
    def publication_status
      object.admin_publication.publication_status
    end
    field :visible_to, ProjectVisibleTo, null: false
    field :process_type, ProjectProcessType, null: false
    field :updated_at, String, null: false
    field :created_at, String, null: false
    field :href, String, null: true

    @@frontend_service = Frontend::UrlService.new
    def href
      @@frontend_service.model_to_url(object)
    end

  end
end