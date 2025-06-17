# frozen_string_literal: true

module EmailCampaigns
  module ContentConfigurable
    extend ActiveSupport::Concern
    included do
      validates :subject_multiloc, presence: true, multiloc: { presence: true }

      # Manual campaigns only.
      with_options if: :manual? do
        validates :body_multiloc, presence: true, multiloc: { presence: true, html: true }
        before_validation :sanitize_body_multiloc
        after_save :process_body_images
      end

      # Automated campaigns only.
      with_options unless: :manual? do
        validates :title_multiloc, multiloc: { presence: true }
        validates :intro_multiloc, multiloc: { presence: false, html: true }
        validates :button_text_multiloc, multiloc: { presence: true, html: true }
        before_validation :sanitize_intro_multiloc
        after_save :process_intro_images
      end
    end

    # TODO: Manual allows some attributes to be set which automated campaigns do not eg sender.

    # For customisable regions we merge in the defaults for multilocs.
    def subject_multiloc
      merge_default_region_values(:subject_multiloc)
    end

    def title_multiloc
      merge_default_region_values(:title_multiloc)
    end

    def intro_multiloc
      merge_default_region_values(:intro_multiloc)
    end

    def button_text_multiloc
      merge_default_region_values(:button_text_multiloc)
    end

    private

    # Methods for manual campaigns
    def process_body_images
      processed_body_multiloc = TextImageService.new.swap_data_images_multiloc body_multiloc, field: :body_multiloc, imageable: self
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

    # Methods for automated campaigns
    def merge_default_region_values(region_key)
      values = self[region_key]
      return values if manual?

      region = mailer_class.editable_regions.find { |r| r[:key] == region_key }
      return values if region.nil?

      allow_blank_locales = region[:allow_blank_locales]
      region[:default_value_multiloc].merge(values) do |_, default, saved|
        saved.blank? && !allow_blank_locales ? default : saved
      end
    end

    def process_intro_images
      processed_intro_multiloc = TextImageService.new.swap_data_images_multiloc intro_multiloc, field: :intro_multiloc, imageable: self
      update_column :intro_multiloc, processed_intro_multiloc
    end

    def sanitize_intro_multiloc
      service = SanitizationService.new
      self.intro_multiloc = service.sanitize_multiloc(
        intro_multiloc,
        %i[alignment list decoration link image video]
      )
      self.intro_multiloc = service.linkify_multiloc intro_multiloc
      self.intro_multiloc = service.remove_multiloc_empty_trailing_tags intro_multiloc
    end
  end
end
