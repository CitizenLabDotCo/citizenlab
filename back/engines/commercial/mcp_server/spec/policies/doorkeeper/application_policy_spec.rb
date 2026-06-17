# frozen_string_literal: true

require 'rails_helper'

describe Doorkeeper::ApplicationPolicy do
  subject(:policy) { described_class.new(user, application) }

  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:application) do
    Doorkeeper::Application.create!(name: 'Acme Connector', redirect_uri: 'https://a.example.com/cb', confidential: false)
  end

  def create_token(owner, app, **opts)
    Doorkeeper::AccessToken.create!(
      resource_owner_id: owner.id, application: app, scopes: 'mcp:access', expires_in: 7200, **opts
    )
  end

  describe '#destroy?' do
    it 'permits revoking a client the user holds a non-revoked token for' do
      create_token(user, application)
      expect(policy.destroy?).to be true
    end

    it 'permits revoking even when the only token is revoked (the row is still shown)' do
      create_token(user, application, revoked_at: Time.current)
      expect(policy.destroy?).to be true
    end

    it "forbids revoking a client the user never authorized (another user's token)" do
      create_token(other_user, application)
      expect(policy.destroy?).to be false
    end

    it 'forbids revoking when there is no current user' do
      create_token(user, application)
      expect(described_class.new(nil, application).destroy?).to be false
    end
  end

  describe 'Scope#resolve' do
    subject(:resolved) { described_class::Scope.new(user, Doorkeeper::Application).resolve }

    let(:other_application) do
      Doorkeeper::Application.create!(name: 'Urban Insights', redirect_uri: 'https://b.example.com/cb', confidential: false)
    end

    it "returns the clients the user holds a non-revoked token for, one row each" do
      create_token(user, application)
      create_token(user, application) # second token, same client -> still one row
      expect(resolved).to contain_exactly(application)
    end

    it 'excludes clients whose tokens are all revoked' do
      create_token(user, application, revoked_at: Time.current)
      expect(resolved).to be_empty
    end

    it "excludes clients only other users have authorized" do
      create_token(other_user, other_application)
      create_token(user, application)
      expect(resolved).to contain_exactly(application)
    end

    it 'is empty when the user holds no tokens' do
      expect(resolved).to be_empty
    end
  end
end
