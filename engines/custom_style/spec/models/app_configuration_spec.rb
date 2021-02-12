# frozen_string_literal: true

require 'rails_helper'
require_relative './style_settings_spec.rb'

RSpec.describe AppConfiguration, type: :model do
  it_behaves_like 'StyleSettings'
end
