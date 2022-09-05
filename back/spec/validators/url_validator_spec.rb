# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UrlValidator do
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
end
