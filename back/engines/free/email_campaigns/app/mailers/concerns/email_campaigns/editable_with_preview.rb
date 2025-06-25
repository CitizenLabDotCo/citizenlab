module EmailCampaigns
  module EditableWithPreview
    extend ActiveSupport::Concern

    class_methods do
      # Each mailer can define its own editable regions.
      # These regions are used to define which custom text can be edited by the admin.
      def editable_regions
        []
      end

      def define_editable_region(key, type: 'text', default_message_key: key.to_s, variables: [], allow_blank_locales: false)
        message_group = "email_campaigns.#{campaign_class.name.demodulize.underscore}"
        {
          key: key,
          type: type,
          variables: variables,
          default_value_multiloc: MultilocService.new.i18n_to_multiloc_liquid_version("#{message_group}.#{default_message_key}") || {},
          allow_blank_locales: allow_blank_locales
        }
      end

      # Static data used that can be across email previews.
      def preview_data(recipient)
        {
          user_first_name: I18n.t('email_campaigns.preview_data.first_name', locale: recipient.locale),
          user_last_name: I18n.t('email_campaigns.preview_data.last_name', locale: recipient.locale),
          user_display_name: I18n.t('email_campaigns.preview_data.display_name', locale: recipient.locale),
          project_title_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.project_title'),
          project_url: "/#{recipient.locale}/projects/example-project",
          comment_body_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.comment_body'),
          idea_title_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.idea_title'),
          idea_url: "/#{recipient.locale}/ideas/example-idea",
          proposal_title_multiloc: MultilocService.new.i18n_to_multiloc('email_campaigns.preview_data.proposal_title')
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
    def format_editable_region(region_key, values: substitution_variables, override_default_key: nil)
      region = self.class.editable_regions.find { |r| r[:key] == region_key }
      return unless region

      # NOTE: Default values for regions are already merged in the campaign class
      multiloc_service = MultilocService.new
      region_text = multiloc_service.t(@campaign.send(region_key), locale.to_s)
      region_default_text = multiloc_service.t(region[:default_value_multiloc], locale.to_s)

      # Sometimes we need to override the default value because the default is conditional
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
  end
end
