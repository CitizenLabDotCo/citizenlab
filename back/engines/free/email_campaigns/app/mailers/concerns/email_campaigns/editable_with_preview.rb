module EmailCampaigns
  module EditableWithPreview
    extend ActiveSupport::Concern

    class_methods do
      # Each mailer can define its own editable regions.
      def editable_regions
        []
      end

      def editable_region(key, type: 'text', default_message_key: key.to_s, variables: [], allow_blank_locales: false)
        message_group = "email_campaigns.#{campaign_class.name.demodulize.underscore}"
        {
          key: key,
          title_multiloc: MultilocService.new.i18n_to_multiloc("email_campaigns.editable_region_names.#{key}"),
          type: type,
          variables: variables,
          default_value_multiloc: MultilocService.new.i18n_to_multiloc_liquid_version("#{message_group}.#{default_message_key}") || {},
          allow_blank_locales: allow_blank_locales
        }
      end

      # Static data used that can be across email previews.
      def preview_data(recipient)
        multiloc_service = MultilocService.new
        {
          first_name: I18n.t('email_campaigns.preview_data.first_name', locale: recipient.locale),
          last_name: I18n.t('email_campaigns.preview_data.last_name', locale: recipient.locale),
          display_name: I18n.t('email_campaigns.preview_data.display_name', locale: recipient.locale),
          comment_body_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.comment_body', locale: recipient.locale),
          idea_title_multiloc: multiloc_service.i18n_to_multiloc('email_campaigns.preview_data.idea_title', locale: recipient.locale),
          idea_url: "/#{recipient.locale}/ideas/example-idea"
        }
      end
    end

    private

    # Variables for substitution in the email templates - override in subclasses.
    def substitution_variables
      {}
    end

    # To format an editable message, use `format_editable_region`.
    # The `region_key` must exist in editable regions.
    def format_editable_region(region_key: nil, values: substitution_variables)
      region = self.class.editable_regions.find { |r| r[:key] == region_key }
      return unless region

      # NOTE: Default values for regions are merged in the campaign class so that both this and the campaign serializer can use.
      multiloc_service = MultilocService.new
      region_text = multiloc_service.t(@campaign.send(region_key), locale.to_s)
      values = values.transform_keys(&:to_s)
      render_liquid_template(text: region_text, values: values, html: region[:type] == 'html')
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
  end
end
