# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationMailer do
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

  describe 'organization_name' do
    before do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Brighton &amp; Hove' }
      config.save!
    end

    it 'unescapes &amp; to &' do
      instance = described_class.new

      expect(instance.organization_name).to eq('Brighton & Hove')
    end
  end
end
