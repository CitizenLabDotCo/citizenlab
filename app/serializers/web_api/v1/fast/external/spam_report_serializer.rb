class WebApi::V1::Fast::External::SpamReportSerializer < WebApi::V1::Fast::BaseSerializer
  attributes :spam_reportable_type, :reason_code, :other_reason, :reported_at

  attribute :url do |object|
    Frontend::UrlService.new.model_to_url object.spam_reportable
  end

  belongs_to :spam_reportable
  belongs_to :user
end