ActiveSupport.on_load(:action_controller) do
  Roles.configure do |c|
    c.serializers = { users: WebApi::V1::UserSerializer }
    c.subscribers = { users: { project_moderator: SideFxModeratorService.new } }
    c.policies = { users: { project_moderator: ModeratorPolicy } }
  end
end
