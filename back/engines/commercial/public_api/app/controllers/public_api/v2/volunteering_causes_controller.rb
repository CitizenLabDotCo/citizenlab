# frozen_string_literal: true

module PublicApi
  class V2::VolunteeringCausesController < PublicApiController
    include DeletedItemsAction

    def index
      list_items Volunteering::Cause.all.includes(:participation_context), V2::VolunteeringCauseSerializer, root_key: 'volunteering_causes'
    end

    def show
      show_item Volunteering::Cause.find(params[:id]), V2::VolunteeringCauseSerializer, root_key: 'volunteering_cause'
    end
  end
end
