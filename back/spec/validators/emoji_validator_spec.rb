# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmojiValidator do
  subject(:record) { Klass.new }

  before do
    klass = Class.new do
      include ActiveModel::Validations
      attr_accessor :icon

      validates :icon, emoji: true
    end

    stub_const('Klass', klass)
  end

  [
    ['a plain emoji', '😀'],
    ['an emoji with a variation selector', '🏙️'],
    ['an emoji with a skin tone', '👍🏽'],
    ['a ZWJ sequence', '👩‍👩‍👧‍👦'],
    ['a flag', '🇧🇪'],
    ['a keycap', '1️⃣'],
    ['a ZWJ sequence with a variation selector', '🏳️‍🌈']
  ].each do |description, value|
    it "accepts #{description}" do
      record.icon = value
      expect(record).to be_valid
    end
  end

  [
    ['markup', '<img src=x onerror=alert(1)>'],
    ['an emoji followed by markup', '😀<img src=x onerror=alert(1)>'],
    ['markup followed by an emoji', '<b>😀</b>'],
    ['two emoji', '😀😀'],
    ['plain text', 'medical'],
    ['a single letter', 'a'],
    ['a bare digit', '1'],
    ['an emoji with surrounding whitespace', ' 😀 '],
    ['an emoji followed by a newline', "😀\n"],
    ['an empty string', ''],
    ['nil', nil]
  ].each do |description, value|
    it "rejects #{description}" do
      record.icon = value
      expect(record).not_to be_valid
      expect(record.errors.details[:icon]).to eq [{ error: :invalid }]
    end
  end

  describe '.emoji?' do
    it 'is false for non-string values' do
      expect(described_class.emoji?(123)).to be false
    end
  end
end
