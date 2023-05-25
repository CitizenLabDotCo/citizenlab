# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::ExampleSerializer < ::WebApi::V1::BaseSerializer
    attributes :mail_body_html, :locale, :subject, :created_at, :updated_at

    belongs_to :campaign
    belongs_to :recipient, serializer: ::WebApi::V1::UserSerializer
  end
end
