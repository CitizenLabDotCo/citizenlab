# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SegmentRegulationsClient do
  subject(:service) { described_class.new(authorization_token: token) }

  let(:token) { 'dummy-authorization-token' }

  describe '.new' do
    it 'fails if no token is provided' do
      expect { described_class.new(authorization_token: nil) }
        .to raise_error(described_class::MissingAuthorizationTokenError)
    end
  end

  describe '#delete' do
    let(:user_ids) { %w[uuid-user-1 uuid-user-2 uuid-user-3] }

    it "sends a request to Segment to create a 'Delete' regulation" do
      allow(HTTParty).to receive(:post)
      service.delete(user_ids)

      expect(HTTParty).to have_received(:post) do |url, body:, headers:|
        expect(url).to eq('https://platform.segmentapis.com/v1beta/workspaces/citizen-lab/regulations')

        body = JSON.parse(body)
        expect(body).to match({
          'regulation_type' => 'Delete',
          'attributes' => { 'name' => 'userId', 'values' => match_array(user_ids.shuffle) }
        })

        expect(headers).to eq({
          Authorization: "Bearer #{token}",
          'Content-Type': 'application/json'
        })
      end
    end
  end
end
