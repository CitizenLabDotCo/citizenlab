module Volunteering
  class SideFxVolunteerService
    include SideFxHelper

    def before_create volunteer, user
    end

    def after_create volunteer, user
      LogActivityJob.perform_later(volunteer, 'created', user, volunteer.created_at.to_i)
    end

    def before_destroy volunteer, user
    end

    def after_destroy frozen_volunteer, user
      serialized_volunteer = clean_time_attributes(frozen_volunteer.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_volunteer), 'deleted', user, Time.now.to_i, payload: {volunteer: serialized_volunteer})
    end
  end
end
