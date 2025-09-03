module EmailCampaigns
  module EditableWithPreview
    extend ActiveSupport::Concern

    # Each mailer can define its own editable regions.
    # These regions are used to define which custom text can be edited by the admin.
    def editable
      []
    end

    def editable_regions
      regions = []
      define_editable_region(regions, :subject_multiloc, default_message_key: 'subject')
      define_editable_region(regions, :title_multiloc, default_message_key: 'title')
      define_editable_region(regions, :intro_multiloc, default_message_key: 'event_description', type: 'html', allow_blank_locales: true)
      define_editable_region(regions, :button_text_multiloc, default_message_key: 'cta_button')
      regions
    end

    # Variables available for substitution in the email templates - override in classes.
    def substitution_variables
      {}
    end

    private

    # Default methods for template output of the common editable regions.
    def subject
      format_editable_region(:subject_multiloc)
    end

    def header_title
      format_editable_region(:title_multiloc)
    end

    def header_message
      format_editable_region(:intro_multiloc)
    end

    def cta_button_text
      format_editable_region(:button_text_multiloc)
    end

    def preheader
      format_message('preheader', values: substitution_variables)
    end

    def define_editable_region(regions, key, type: 'text', default_message_key: key.to_s, allow_blank_locales: false)
      return unless editable.include?(key)

      message_group = "email_campaigns.#{self.class.name.demodulize.underscore.gsub('_mailer', '')}"
      regions << {
        key: key,
        type: type,
        default_value_multiloc: MultilocService.new.i18n_to_multiloc_liquid_version("#{message_group}.#{default_message_key}", raise_on_missing: !allow_blank_locales) || {},
        allow_blank_locales: allow_blank_locales
      }
    end

    # To format an editable message, use `format_editable_region`.
    # The `region_key` must exist in editable regions.
    def format_editable_region(region_key, values: substitution_variables, override_default_key: nil)
      region = editable_regions.find { |r| r[:key] == region_key }
      return unless region

      # NOTE: Default values for regions are already merged in the campaign class
      multiloc_service = MultilocService.new
      region_text = multiloc_service.t(@campaign.send(region_key), locale.to_s)
      region_default_text = multiloc_service.t(region[:default_value_multiloc], locale.to_s)

      # Sometimes we need to override the default value returned to the editor because the default is conditional
      # eg in `CommentOnIdeaYouFollowMailer` where title is dependent on the input term.
      if override_default_key && region_text == region_default_text
        message_group = "email_campaigns.#{campaign.class.name.demodulize.underscore}"
        region_text = I18n.t("#{message_group}.#{override_default_key}", locale: locale.to_s).gsub(/%\{(.*?)}/, '{{\1}}')
      end

      render_liquid_template(
        text: region_text,
        values: values.transform_keys(&:to_s),
        html: region[:type] == 'html'
      )
    end

    def render_liquid_template(text: nil, values: {}, html: false)
      template_text = html ? fix_image_widths(text) : text
      template = Liquid::Template.parse(template_text)
      rendered_value = template.render(values)
      html ? rendered_value.html_safe : rendered_value
    end

    def fix_image_widths(html)
      doc = Nokogiri::HTML.fragment(html)
      doc.css('img').each do |img|
        # Set the width to 100% if it's not set.
        # Otherwise, the image will be displayed at its original size.
        # This can mess up the layout if the original image is e.g. 4000px wide.
        img['width'] = '100%' if img['width'].blank?
      end
      doc.to_s
    end

    def preview_service
      @preview_service ||= PreviewService.new
    end
  end
end
