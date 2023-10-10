# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationMailer do
  describe 'localize_for_recipient_and_truncate' do
    let!(:user) { create(:user, locale: 'en') }
    let(:multiloc) { { 'en' => "Some test content text. A link is included here to test links when text is truncated: <a href=\"https://en.wikipedia.org/wiki/Ada_Lovelace\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">https://en.wikipedia.org/wiki/Ada_Lovelace</a>\nThis is a newline." } }

    it 'truncates the text and linkifies correctly' do
      instance = described_class.new
      instance.instance_variable_set(:@user, user)

      expect(instance.send(:localize_for_recipient_and_truncate, multiloc, 140))
        .to eq("Some test content text. A link is included here to test links when text is truncated: <a href=\"https://en.wikipedia.org/wiki/Ada_Lovelace\" target=\"_blank\" rel=\"noreferrer noopener nofollow\">https://en.wikipedia.org/wiki/Ada_Lovelace</a>\nThis is...")
    end
  end
end
