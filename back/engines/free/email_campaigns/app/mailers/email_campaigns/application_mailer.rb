# frozen_string_literal: true

module EmailCampaigns
  class ApplicationMailer < ApplicationMailer
    layout 'campaign_mailer'

    before_action do
      @command, @campaign = params.values_at(:command, :campaign)
      @user = @command[:recipient]
    end

    def campaign_mail
      I18n.with_locale(locale.locale_sym) do
        mail(default_config, &:mjml).tap do |message|
          message.mailgun_headers = mailgun_headers if self.class.delivery_method == :mailgun
        end
      end
    end

    attr_reader :command, :campaign

    helper_method :command, :campaign, :event, :show_unsubscribe_link?, :cta_button_text

    # Each mailer can define its own editable regions.
    def self.editable_regions
      []
    end

    private

    def show_unsubscribe_link?
      user && campaign.class.try(:consentable_for?, user)
    end

    def show_terms_link?
      true
    end

    def show_privacy_policy_link?
      true
    end

    # To format a non-editable message, use `format_message`.
    def format_message(key, component: nil, escape_html: true, values: {})
      group = component || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", **values)
      escape_html ? msg : msg.html_safe
    end

    # To format an editable message, use `format_editable_region`.
    # The `region_key` must exist in editable regions.
    def format_editable_region(region_key: nil, values: {})
      region = self.class.editable_regions.find { |r| r[:key] == region_key }
      return unless region

      # NOTE: Default values for regions are merged in the campaign class so that both this and the campaign serializer can use.
      multiloc_service = MultilocService.new
      region_text = multiloc_service.t(@campaign.send(region_key), locale.to_s)
      values = values.transform_keys(&:to_s)

      # TODO: Need to santitize here
      render_liquid_template(text: region_text, values: values, html: region[:type] == 'html')
    end

    private_class_method def self.editable_region(key, type: 'text', default_message_key: key.to_s, variables: [])
      message_group = "email_campaigns.#{campaign_class.name.demodulize.underscore}"
      {
        key: key,
        title_multiloc: MultilocService.new.i18n_to_multiloc("email_campaigns.editable_region_names.#{key.to_s}"),
        type: type,
        variables: variables,
        default_value_multiloc: MultilocService.new.i18n_to_multiloc_liquid_version("#{message_group}.#{default_message_key}") || {}
      }
    end

    def render_liquid_template(text: nil, values: {}, html: false)
      template_text = html ? fix_image_widths(text) : text
      template = Liquid::Template.parse(template_text)
      template.render(values)
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

    def reply_to_email
      command[:reply_to] || super
    end

    def event
      @event ||= to_deep_struct(command[:event_payload])
    end

    def mailgun_variables
      super.merge!('cl_campaign_id' => campaign.id)
    end
  end
end
