# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminApi::Schema do
  let(:context) { {} }
  let(:result) do
    described_class.execute(
      query_string,
      context: context,
      variables: variables
    )
  end

  describe 'user' do
    let(:query_string) do
      %|
        query userQuery($id: ID!) {
          user(id: $id) {
            id
            firstName
            lastName
            email
            slug
            locale
          }
        }
      |
    end

    let(:user) { create(:user) }
    let(:variables) { { id: user.id } }

    it 'returns all users' do
      response = result
      expect(response.dig('data', 'user')).to match({
        'id' => user.id,
        'firstName' => user.first_name,
        'lastName' => user.last_name,
        'email' => user.email,
        'slug' => user.slug,
        'locale' => user.locale
      })
    end
  end

  describe 'unsubscriptionToken' do
    let(:query_string) do
      %|
        query userQuery($id: ID!) {
          user(id: $id) {
            unsubscriptionToken
          }
        }
      |
    end
    let(:user) { create(:user) }
    let!(:unsubscription_token) { create(:email_campaigns_unsubscription_token, user: user) }
    let(:variables) { { id: user.id } }

    it 'returns an unsubscriptionToken' do
      response = result
      expect(response.dig('data', 'user')).to match({
        'unsubscriptionToken' => unsubscription_token.token
      })
    end
  end
end
