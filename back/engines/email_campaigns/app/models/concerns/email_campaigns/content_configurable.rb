module EmailCampaigns
  module ContentConfigurable
    extend ActiveSupport::Concern

    MAX_SUBJECT_LEN = 80

    included do
      validates :subject_multiloc, presence: true, multiloc: {presence: true, length: {maximum: MAX_SUBJECT_LEN}}
      validates :body_multiloc, presence: true, multiloc: {presence: true}

      after_save :process_body_images
    end

    def process_body_images
      processed_body_multiloc = TextImageService.new.swap_data_images(self, :body_multiloc)
      self.update_column(:body_multiloc, processed_body_multiloc)
    end

  end
end