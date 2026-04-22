# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationMailer do
  describe 'custom_smtp' do
    let_it_be(:user) { create(:user, locale: 'en') }

    let(:smtp_settings) do
      {
        'address' => 'smtp.example.com',
        'port' => 465,
        'domain' => 'example.com',
        'user_name' => 'testuser',
        'password' => 'testpass',
        'authentication' => 'login',
        'enable_starttls_auto' => false,
        'openssl_verify_mode' => 'peer'
      }
    end

    context 'when custom_smtp is enabled' do
      before do
        SettingsService.new.activate_feature!('custom_smtp', settings: smtp_settings)
      end

      it 'includes delivery_method and delivery_method_options in default_config' do
        instance = described_class.new
        instance.instance_variable_set(:@user, user)

        config = instance.send(:default_config)

        expect(config[:delivery_method]).to eq(:smtp)
        expect(config[:delivery_method_options]).to include(
          address: 'smtp.example.com',
          port: 465,
          domain: 'example.com',
          user_name: 'testuser',
          password: 'testpass',
          authentication: :login,
          enable_starttls_auto: false,
          openssl_verify_mode: 'peer'
        )
      end

      it 'only includes SMTP options that are set' do
        SettingsService.new.activate_feature!('custom_smtp', settings: { 'address' => 'mail.test.org' })

        instance = described_class.new
        instance.instance_variable_set(:@user, user)

        options = instance.send(:default_config)[:delivery_method_options]

        expect(options[:address]).to eq('mail.test.org')
        expect(options).not_to have_key(:user_name)
        expect(options).not_to have_key(:password)
        expect(options).not_to have_key(:domain)
        expect(options).not_to have_key(:openssl_verify_mode)
      end
    end

    context 'when custom_smtp is not enabled' do
      it 'does not include delivery_method_options in default_config' do
        instance = described_class.new
        instance.instance_variable_set(:@user, user)

        config = instance.send(:default_config)

        expect(config).not_to have_key(:delivery_method)
        expect(config).not_to have_key(:delivery_method_options)
      end
    end
  end

  describe 'localize_for_recipient_and_truncate' do
    let_it_be(:user) { create(:user, locale: 'en') }
    let_it_be(:multiloc) { { 'en' => "Some test content text. A link is included here to test links when text is truncated: <a href=\"https://en.wikipedia.org/wiki/Ada_Lovelace\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">https://en.wikipedia.org/wiki/Ada_Lovelace</a>\nThis is a newline." } }

    # If we naively truncated the original string to 140 characters length, we would end up with a broken link,
    # so we test this case.
    it 'truncates the text and linkifies correctly' do
      instance = described_class.new
      instance.instance_variable_set(:@user, user)

      expect(instance.send(:localize_for_recipient_and_truncate, multiloc, 140))
        .to eq("Some test content text. A link is included here to test links when text is truncated: <a href=\"https://en.wikipedia.org/wiki/Ada_Lovelace\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">https://en.wikipedia.org/wiki/Ada_Lovelace</a>\nThis is...")
    end
  end
end
