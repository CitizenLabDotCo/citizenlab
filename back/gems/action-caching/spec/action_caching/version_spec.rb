# frozen_string_literal: true

require 'spec_helper'

RSpec.describe ActionCaching do
  it 'has a version number' do
    expect(ActionCaching::VERSION).not_to be_nil
    expect(ActionCaching::VERSION).to match(/\d+\.\d+\.\d+/)
  end
end
