# frozen_string_literal: true

RSpec.shared_examples 'not authorized to visitors' do
  context 'when visitor' do
    example 'returns 401 (Unauthorized)', document: false do
      do_request
      expect(status).to eq(401)
    end
  end
end

RSpec.shared_examples 'not authorized to normal users' do
  context 'when normal user (logged in)' do
    before { user_header_token }

    example 'returns 401 (Unauthorized)', document: false do
      do_request
      expect(status).to eq(401)
    end
  end
end
