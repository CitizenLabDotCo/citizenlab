# frozen_string_literal: true

module Polls
  class SideFxResponseService
    include SideFxHelper

    def after_create(response, user)
      create_followers response, user
      LogActivityJob.perform_later(response, 'created', user, response.created_at.to_i)
    end

    private

    def create_followers(response, user)
      project = response.participation_context.project
      Follower.find_or_create_by(followable: project, user: user)
      return if !project.in_folder?

      Follower.find_or_create_by(followable: project.folder, user: user)
    end
  end
end
