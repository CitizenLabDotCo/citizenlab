# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::Sms::BalanceController < EmailCampaignsController
    def show
      authorize :sms_balance, :show?, policy_class: EmailCampaigns::Sms::BalancePolicy

      render json: raw_json(EmailCampaigns::Sms::BalanceService.new.to_h, type: 'sms_balance')
    end
  end
end
