# frozen_string_literal: true

require 'rails_helper'

describe UserjotIdentityService do
  subject(:service) { described_class.new }

  let(:project_id) { 'userjot-project-id' }
  let(:secret) { 'userjot-project-secret' }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with('USERJOT_PROJECT_ID', nil).and_return(project_id)
    allow(ENV).to receive(:fetch).with('USERJOT_PROJECT_SECRET', nil).and_return(secret)
  end

  describe '#identity' do
    it 'signs the user id with the project secret' do
      user = create(:admin)

      expect(service.identity(user)).to eq(
        project_id: project_id,
        signature: OpenSSL::HMAC.hexdigest('SHA256', secret, user.id)
      )
    end
  end

  describe '#configured?' do
    it { expect(service.configured?).to be true }

    context 'when the project id is missing' do
      let(:project_id) { nil }

      it { expect(service.configured?).to be false }
    end

    context 'when the secret is missing' do
      let(:secret) { '' }

      it { expect(service.configured?).to be false }
    end
  end
end
