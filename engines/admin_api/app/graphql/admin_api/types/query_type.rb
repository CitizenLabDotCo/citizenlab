module AdminApi
  class Types::QueryType < GraphQL::Schema::Object
    description "The query root of this schema"

    field :tenants, [Types::TenantType], null: false

    def tenants
      Tenant.all
    end

    field :current_tenant, Types::TenantType, null: false
    def current_tenant
      Tenant.current
    end

    field :tenant, Types::TenantType, null: false do
      argument :id, ID, required: true
    end

    def tenant args
      Tenant.find(args[:id])
    end


    field :tenant_by_host, Types::TenantType, null: false do
      argument :host, String, required: true
    end

    def tenant_by_host args
      Tenant.find_by(host: args[:host])
    end

    field :ideas, Types::IdeaType.connection_type, null: false

    def ideas
      Idea.all
    end

    class IdeaSorting < GraphQL::Schema::Enum
      value :trending
      value :popular
      value :new
    end

    field :public_ideas, Types::IdeaType.connection_type, null: false do
      argument :sort, IdeaSorting, required: false
      argument :topics, [ID], required: false
      argument :projects, [ID], required: false
    end

    def public_ideas args={}
      ideas = ::IdeaPolicy::Scope.new(nil, Idea)
        .resolve
        .includes(:idea_images)
        .published

      if args[:sort].present? && !args[:search].present?
        ideas = case args[:sort]
          when "trending"
            TrendingIdeaService.new.sort_trending ideas
          when "popular"
            ideas.order_popular
          when "new"
            ideas.order_new
          end
      end

      ideas = ideas.with_some_topics(args[:topics]) if args[:topics].present?
      ideas = ideas.where(project_id: args[:projects]) if args[:projects].present?

      ideas
    end

    field :initiatives, Types::InitiativeType.connection_type, null: false

    def initiatives
      Initiative.all
    end

    field :public_initiatives, Types::InitiativeType.connection_type, null: false

    def public_initiatives args={}
      initiatives = ::InitiativePolicy::Scope.new(nil, Initiative)
        .resolve
        .includes(:initiative_images)
        .published

      initiatives
    end

    field :user, Types::UserType, null: false do
      argument :id, ID, required: true
    end

    def user args
      User.find(args[:id])
    end

    field :project, Types::ProjectType, null: false do
      argument :id, ID, required: true
    end

    def project args
      Project.find(args[:id])
    end

    field :public_projects , Types::ProjectType.connection_type, null:false

    def public_projects
      ::ProjectPolicy::Scope.new(nil, Project).resolve
    end

    field :project_folder, Types::ProjectFolderType, null: false do
      argument :id, ID, required: true
    end

    def project_folder args
      ProjectFolders::Folder.find(args[:id])
    end

    field :public_project_folders , Types::ProjectFolderType.connection_type, null:false

    def public_project_folders
      ::ProjectFolders::FolderPolicy::Scope.new(nil, ::ProjectFolders::Folder).resolve.includes(:admin_publication)
    end

    field :idea, Types::IdeaType, null: false do
      argument :id, ID, required: true
      description "Find an idea by ID"
    end

    def idea args
      Idea.find(args[:id])
    end

    field :initiative, Types::InitiativeType, null: false do
      argument :id, ID, required: true
      description "Find an initiative by ID"
    end

    def initiative args
      Initiative.find(args[:id])
    end

    field :public_pages, Types::PageType.connection_type, null: false
    def public_pages
      ::PagePolicy::Scope.new(nil, Page).resolve
    end

  end
end
