# frozen_string_literal: true

module PublicApi
  class V2::VolunteeringVolunteersController < PublicApiController
    include DeletedItemsAction

    def index
      # Only include manual campaigns - system generated campaigns should stay internal
      list_items Volunteering::Volunteer.all, V2::VolunteeringVolunteerSerializer, root_key: 'volunteering_volunteers'
    end

    def show
      show_item Volunteering::Volunteer.find(params[:id]), V2::VolunteeringVolunteerSerializer, root_key: 'volunteering_volunteer'
    end
  end
end
