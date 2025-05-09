# frozen_string_literal: true

RSpec.shared_examples 'unauthorized' do
  example_request 'Unauthorized' do
    expect(status).to eq(401)
  end
end
