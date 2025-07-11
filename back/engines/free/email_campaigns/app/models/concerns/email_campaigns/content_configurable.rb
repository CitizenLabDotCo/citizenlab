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
        validates :button_text_multiloc, multiloc: { presence: true }, if: :editable_button_text?
        before_validation :sanitize_intro_multiloc
        before_validation :reject_default_region_values
        after_save :process_intro_images
      end
    end

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

    def sanitize_multiloc(multiloc, features)
      service = SanitizationService.new
      value = self[multiloc]
      value = service.sanitize_multiloc(
        value,
        features
      )
      value = service.linkify_multiloc value
      value = service.remove_multiloc_empty_trailing_tags value
      self[multiloc] = value
    end

    def process_images(multiloc)
      processed_multiloc = TextImageService.new.swap_data_images_multiloc self[multiloc], field: multiloc, imageable: self
      update_column multiloc, processed_multiloc
    end

    # Methods for manual campaigns
    def sanitize_body_multiloc
      sanitize_multiloc(:body_multiloc, %i[title alignment list decoration link image video])
    end

    def process_body_images
      process_images(:body_multiloc)
    end

    # Methods for automated campaigns
    def sanitize_intro_multiloc
      sanitize_multiloc(:intro_multiloc, %i[alignment list decoration link image video])
    end

    def process_intro_images
      process_images(:intro_multiloc)
    end

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

    # Reject default region values from the saved values, so that the defaults always remain the latest.
    def reject_default_region_values
      regions = mailer_class.editable_regions
      regions.each do |region|
        field = region[:key]
        self[field] = self[field].reject do |locale, value|
          value == region[:default_value_multiloc][locale]
        end
      end
    end

    def editable_button_text?
      mailer_class.editable_regions.any? { |region| region[:key] == :button_text_multiloc }
    end
  end
end
