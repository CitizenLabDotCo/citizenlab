# frozen_string_literal: true

module PublicApi
  class V2::EmailCampaignsController < PublicApiController
    include DeletedItemsAction

    def index
      # Only include manual campaigns - system generated campaigns should stay internal
      list_items EmailCampaigns::Campaign.where(type: 'EmailCampaigns::Campaigns::Manual'), V2::EmailCampaignSerializer, root_key: 'email_campaigns'
    end

    def show
      show_item EmailCampaigns::Campaign.find(params[:id]), V2::EmailCampaignSerializer, root_key: 'email_campaign'
    end
  end
end
