# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CssColorValidator do
  subject(:record) { Klass.new }

  before do
    klass = Class.new do
      include ActiveModel::Validations
      attr_accessor :color

      validates :color, presence: true, css_color: true
    end

    stub_const('Klass', klass)
  end

  it 'recognizes 3 digit hex values' do
    record.color = '#fff'
    expect(record).to be_valid
  end

  it 'recognizes 6 digit hex values' do
    record.color = '#123def'
    expect(record).to be_valid
  end

  it 'recognizes rgb values' do
    record.color = 'rgb(255,255,255)'
    expect(record).to be_valid
  end

  it 'recognizes rgba values' do
    record.color = 'rgba(255, 255, 255, 0)'
    expect(record).to be_valid
  end

  it 'recognizes hsl values' do
    record.color = 'hsl(180, 50%, 50%)'
    expect(record).to be_valid
  end

  it 'recognizes keywords' do
    %w[none transparent inherit].each do |keyword|
      record.color = keyword
      expect(record).to be_valid
    end
  end

  it 'adds an error when value is invalid' do
    record.color = 'notacsscolor'
    expect(record).to be_invalid
  end
end
