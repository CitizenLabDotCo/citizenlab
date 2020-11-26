ActiveSupport.on_load(:action_controller) do
  Roles.configure do |c|
    c.serializers = {
      users: WebApi::V1::UserSerializer
    }

    # c.subscribers = {
    #   users: {
    #     project_folder_moderator: ProjectFolders::SideFxModeratorService.new
    #   }
    # }

    c.policies = {
      users: {
        project_folder_moderator: ProjectFolders::ModeratorPolicy
      }
    }
  end
end
