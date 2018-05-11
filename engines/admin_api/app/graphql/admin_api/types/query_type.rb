module AdminApi
  class Types::QueryType < GraphQL::Schema::Object
    description "The query root of this schema"

    field :tenants, [Types::TenantType], null: false

    def tenants
      Tenant.all
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

    field :public_ideas, Types::IdeaType.connection_type, null: false

    def public_ideas
      ::IdeaPolicy::Scope.new(nil, Idea).resolve.published
    end

    field :public_projects , Types::ProjectType.connection_type, null:false

    def public_projects
      ::ProjectPolicy::Scope.new(nil, Project).resolve
    end

    field :idea, Types::IdeaType, null: false do
      argument :id, ID, required: true
      description "Find an idea by ID"
    end

    def idea args
      Idea.find(args[:id])
    end

  end
end