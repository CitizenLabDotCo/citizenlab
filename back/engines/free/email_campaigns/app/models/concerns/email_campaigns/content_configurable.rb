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
      merge_default_region_values(super, :subject_multiloc)
    end

    def title_multiloc
      merge_default_region_values(super, :title_multiloc)
    end

    def intro_multiloc
      merge_default_region_values(super, :intro_multiloc)
    end

    def button_text_multiloc
      merge_default_region_values(super, :button_text_multiloc)
    end

    # Methods to proxy mailer methods
    def editable_regions
      @editable_regions ||= empty_mailer.editable_regions
    end

    def preview_command(recipient)
      @preview_command ||= empty_mailer.preview_command(recipient)
    end

    def substitution_variables
      @substitution_variables ||= empty_mailer.substitution_variables
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

    def merge_default_region_values(value, region_key)
      return value if manual?

      region = editable_regions.find { |r| r[:key] == region_key }
      return value if region.nil?

      allow_blank_locales = region[:allow_blank_locales]
      region[:default_value_multiloc].merge(value) do |_, default, saved|
        saved.blank? && !allow_blank_locales ? default : saved
      end
    end

    # Reject default region values from the saved values, so that the defaults always remain the latest.
    def reject_default_region_values
      editable_regions.each do |region|
        field = region[:key]
        self[field] = self[field].reject do |locale, value|
          next true if region[:default_value_multiloc][locale] == value

          global_campaign && global_campaign[field]&.dig(locale) == value
        end
      end
    end

    def editable_button_text?
      editable_regions.any? { |region| region[:key] == :button_text_multiloc }
    end

    def empty_mailer
      @empty_mailer ||= mailer_class.new
    end
  end
end
