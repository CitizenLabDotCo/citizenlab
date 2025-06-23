# frozen_string_literal: true

RSpec.shared_examples 'unauthorized' do
  example '[ERROR] Unauthorized', document: false do
    do_request
    expect(status).to eq(401)
  end
end

RSpec.shared_examples 'not_found' do
  example '[ERROR] Not Found', document: false do
    do_request
    expect(status).to eq(404)
  end
end
