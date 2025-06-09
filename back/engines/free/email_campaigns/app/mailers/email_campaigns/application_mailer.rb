# frozen_string_literal: true

module EmailCampaigns
  class ApplicationMailer < ApplicationMailer
    layout 'campaign_mailer'

    helper_method :show_unsubscribe_link?

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

    helper_method :command, :campaign, :event

    # Each mailer can define its own editable regions.
    def self.editable_regions
      []
    end

    # If there are editable regions
    def self.default_custom_text_multiloc
      {}
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

    def format_message(key, component: nil, escape_html: true, values: {})
      group = component || @campaign.class.name.demodulize.underscore
      msg = t("email_campaigns.#{group}.#{key}", **values)
      escape_html ? msg : msg.html_safe
    end

    def format_custom_text(key, values: {})
      # TODO: What about HTML escaping? Should we always escape?

      # Are there any overrides for this key in the campaign record?
      override = @campaign.custom_text_multiloc&.dig(locale.locale_sym.to_s, key)
      if override.present?
        template = Liquid::Template.parse(override)
        values = values.transform_keys(&:to_s)
        return template.render(values)
      end

      # Fallback to the default text
      format_message(key, values:)
    end

    # Seems to get called three times
    # TODO: Maybe add a CampaignClass to mailer so we can avoid hardcoding strings?
    # TODO: How does the manual mailer handle {{ variable }}?
    private_class_method def self.editable_region(key, type: 'text', default_value_key: nil, variables: [])
      {
        key: key,
        title_multiloc: MultilocService.new.i18n_to_multiloc("email_campaigns.edit_region_names.#{key}"),
        type: type,
        variables: variables,
        default_value_multiloc: default_value_key ? MultilocService.new.i18n_to_multiloc_liquid_version(default_value_key) : {}
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
