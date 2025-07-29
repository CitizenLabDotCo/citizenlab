# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::DescriptionGenerator do
  subject(:service) { described_class.new }

  let(:file) { create(:file, name: 'afvalkalender.pdf') }

  it 'generates descriptions for a file' do
    service.generate_descriptions!(file)

    expect(file.description_multiloc).to be_present
    expect(file.description_multiloc.keys).to match_array %w[en nl-NL fr-FR]
  end
end
