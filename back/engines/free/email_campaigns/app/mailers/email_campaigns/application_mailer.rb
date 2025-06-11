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
      return unless region_key
      return Error unless self.class.editable_regions.any? { |r| r[:key] == region_key }

      # TODO: What about HTML escaping? Should we always escape?
      # NOTE: custom_text_multiloc returns default values if not overridden
      override = @campaign.custom_text_multiloc&.dig(locale.locale_sym.to_s, region_key)
      template = Liquid::Template.parse(override)
      values = values.transform_keys(&:to_s)
      template.render(values)
    end

    # TODO: Seems to get called three times per email?
    # TODO: How does the manual mailer handle {{ variable }}?
    private_class_method def self.editable_region(key, type: 'text', message_key: key, variables: [])
      message_group = "email_campaigns.#{campaign_class.name.demodulize.underscore}"
      {
        key: key,
        title_multiloc: MultilocService.new.i18n_to_multiloc("email_campaigns.edit_region_names.#{key}"),
        type: type,
        variables: variables,
        default_value_multiloc: MultilocService.new.i18n_to_multiloc_liquid_version("#{message_group}.#{message_key}") || {}
      }
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
