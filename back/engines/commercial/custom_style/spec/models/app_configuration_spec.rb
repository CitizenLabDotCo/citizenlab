# frozen_string_literal: true

require 'rails_helper'
require_relative './style_settings_spec'

RSpec.describe AppConfiguration, type: :model do
  before(:all) do
    described_class.include(CustomStyle::StyleSettings)
  end

  after(:all) do
    # Removes CustomStyle::StyleSettings from AppConfiguration
    Object.send(:remove_const, :AppConfiguration)
    load(Rails.root.join('app/models/app_configuration.rb'))
  end

  it_behaves_like 'StyleSettings'
end
