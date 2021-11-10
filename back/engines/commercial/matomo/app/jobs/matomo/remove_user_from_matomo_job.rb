# frozen_string_literal: true

module Matomo
  class RemoveUserFromMatomoJob
    self.priority = 70 # lower priority than default, but still higher than DeleteUserJob

    def run(user_id)
      Matomo::Client.new.delete_user_data(user_id)
    end
  end
end
