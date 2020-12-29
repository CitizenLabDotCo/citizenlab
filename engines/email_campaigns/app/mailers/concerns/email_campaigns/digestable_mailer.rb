module EmailCampaigns
  module DigestableMailer
    extend ActiveSupport::Concern

    included do
      helper_method :top_ideas, :new_initiatives, :successfull_initiatives, :top_project_ideas, :published_days_diff
    end

    private

    def top_project_ideas
      event_payload(:top_project_ideas)
    end

    def top_ideas
      event_payload(:top_ideas)
    end

    def new_initiatives
      event_payload(:new_initiatives)
    end

    def successfull_initiatives
      event_payload(:succesful_initiatives)
    end

    def published_days_diff(serialized_resource)
      return unless serialized_resource.key?(:published_at)

      (Time.zone.today - serialized_resource[:published_at].to_date).to_i
    end
  end
end
