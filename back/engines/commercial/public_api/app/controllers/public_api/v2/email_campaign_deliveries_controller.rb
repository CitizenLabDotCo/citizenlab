# frozen_string_literal: true

module PublicApi
  class V2::EmailCampaignDeliveriesController < PublicApiController
    include DeletedItemsAction

    def index
      list_items EmailCampaigns::Delivery, V2::EmailCampaignDeliverySerializer, root_key: 'email_campaign_deliveries'
    end

    def show
      show_item EmailCampaigns::Delivery.find(params[:id]), V2::EmailCampaignDeliverySerializer, root_key: 'email_campaign_delivery'
    end
  end
end
