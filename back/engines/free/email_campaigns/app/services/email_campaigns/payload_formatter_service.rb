# frozen_string_literal: true

module EmailCampaigns
  class PayloadFormatterService
    def format_ideas_list(ideas, recipient)
      ideas.map do |idea|
        {
          title_multiloc: idea.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          images: idea.idea_images.map do |image|
            {
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end
        }
      end
    end
  end
end
