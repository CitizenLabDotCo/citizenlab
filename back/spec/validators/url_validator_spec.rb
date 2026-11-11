# frozen_string_literal: true

require 'rails_helper'

# `url: true` resolves to the validate_url gem's validator, not an app class.
RSpec.describe ActiveModel::Validations::UrlValidator do
  subject(:record) { Klass.new }

  before do
    klass = Class.new do
      include ActiveModel::Validations
      attr_accessor :link

      validates :link, presence: true, url: true
    end

    stub_const('Klass', klass)
  end

  it 'allows HTTP URLs' do
    record.link = 'http://example.com'
    expect(record).to be_valid
  end

  it 'allows HTTPS URLs' do
    record.link = 'https://example.com'
    expect(record).to be_valid
  end

  it 'does not allow invalid URLs' do
    record.link = 'notavalidurl'
    expect(record).to be_invalid
  end

  it 'allows URLs with paths, queries and fragments' do
    record.link = 'https://us02web.zoom.us/j/123?pwd=abc%20def#success'
    expect(record).to be_valid
  end

  it 'does not allow script-bearing schemes' do
    ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)'].each do |link|
      record.link = link
      expect(record).to be_invalid, "expected #{link.inspect} to be invalid"
    end
  end

  it 'does not allow a URL that only starts with http(s):// on a later line' do
    record.link = "javascript:alert(document.cookie)//\nhttps://example.com"
    expect(record).to be_invalid
  end

  it 'does not allow text before the scheme' do
    record.link = 'see https://example.com'
    expect(record).to be_invalid
  end

  it 'does not allow whitespace or control characters inside the URL' do
    ["https://example.com/\tjavascript:alert(1)", "https://example.com/\r\n", 'https://example.com/a b'].each do |link|
      record.link = link
      expect(record).to be_invalid, "expected #{link.inspect} to be invalid"
    end
  end
end
