# frozen_string_literal: true

module EmailCampaigns
  module ContentConfigurable
    extend ActiveSupport::Concern
    included do
      validates :subject_multiloc, presence: true, multiloc: { presence: true }
      validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }
      after_save :process_body_images

      before_validation :sanitize_body_multiloc
    end

    def process_body_images
      processed_body_multiloc = TextImageService.new.swap_data_images self, :body_multiloc
      update_column :body_multiloc, processed_body_multiloc
    end

    def sanitize_body_multiloc
      service = SanitizationService.new
      self.body_multiloc = service.sanitize_multiloc(
        body_multiloc,
        %i[title alignment list decoration link image video]
      )
      self.body_multiloc = service.linkify_multiloc body_multiloc
      self.body_multiloc = service.remove_multiloc_empty_trailing_tags body_multiloc
    end
  end
end
