class WebApi::V1::External::SpamReportSerializer < ActiveModel::Serializer
  attributes :id, :spam_reportable_type, :reason_code, :other_reason, :reported_at, :url

  belongs_to :spam_reportable
  belongs_to :user

  def url
    Frontend::UrlService.new.model_to_url object.spam_reportable
  end
end