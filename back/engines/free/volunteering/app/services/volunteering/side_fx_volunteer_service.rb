# frozen_string_literal: true

module Volunteering
  class SideFxVolunteerService
    include SideFxHelper

    def after_create(volunteer, user)
      create_followers volunteer, user
      LogActivityJob.perform_later(volunteer, 'created', user, volunteer.created_at.to_i)
    end

    def after_destroy(frozen_volunteer, user)
      serialized_volunteer = clean_time_attributes(frozen_volunteer.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_volunteer), 'deleted', user, Time.now.to_i, payload: { volunteer: serialized_volunteer })
    end

    private

    def create_followers(volunteer, user)
      project = volunteer.cause.participation_context.project
      Follower.find_or_create_by(followable: project, user: user)
      return if !project.in_folder?

      Follower.find_or_create_by(followable: project.folder, user: user)
    end
  end
end
