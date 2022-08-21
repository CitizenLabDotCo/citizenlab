# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

# This suite of tests verifies whether smart group caching invalidation is
# functioning properly, meaning that smart groups are correctly updating their
# memberships when behavior that's supposed to invalidate current memberships
# happens.
describe 'Memberships', type: 'request' do
  context 'as a normal user' do
    before do
      @user = create(:user, email: 'someone@test.com')
      @token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    end

    describe 'updating her email' do
      before do
        @group1 = create(:smart_group)
        @group2 = create(:smart_group, rules: [
          { ruleType: 'email', predicate: 'ends_on', value: 'newdomain.com' }
        ])
        create(:membership, group: @group1, user: @user)
        headers = { 'Authorization' => "Bearer #{@token}" }
        patch("/web_api/v1/users/#{@user.id}", params: {
          user: {
            email: 'someone@newdomain.com'
          }
        }, headers: headers)
      end

      it 'removes her from a group that no longer matches' do
        expect(@user.reload.groups).not_to include @group1
      end

      it 'adds her to a group that now matches' do
        expect(@user.reload.groups).to include @group2
      end
    end
  end

  describe 'registering a user' do
    it 'adds her to the matching group' do
      group = create(:smart_group, rules: [
        { ruleType: 'email', predicate: 'ends_on', value: 'matching.com' }
      ])
      post('/web_api/v1/users', params: {
        user: {
          first_name: Faker::Name.first_name,
          last_name: Faker::Name.last_name,
          email: 'someone@matching.com',
          password: Faker::Internet.password,
          locale: 'en'
        }
      })
      new_user = User.find_by!(email: 'someone@matching.com')
      expect(new_user.groups).to include(group)
    end
  end

  context 'as an admin' do
    before do
      admin = create(:admin)
      @token = Knock::AuthToken.new(payload: admin.to_token_payload).token
      @headers = { 'Authorization' => "Bearer #{@token}" }
    end

    describe 'creating a smart group' do
      it 'creates the right memberships' do
        create(:user, email: 'someone@newdomain.com')
        user2 = create(:user, email: 'somone@test.com')
        post('/web_api/v1/groups', params: {
          group: {
            title_multiloc: { en: 'With @test.com email' },
            membership_type: 'rules',
            rules: [
              { ruleType: 'email', predicate: 'ends_on', value: 'test.com' }
            ]
          }
        })
        group = Group.find_by!(title_multiloc: { en: 'With @test.com email' })
        expect(group.members).to match_array([user2])
      end
    end

    describe 'updating a smart group' do
      it 'updates the memberships' do
        group = create(:smart_group)
        user1 = create(:user, email: 'someone@newdomain.com')
        user2 = create(:user, email: 'somone@test.com')
        create(:membership, group: group, user: user2)
        patch("/web_api/v1/groups/#{group.id}", params: {
          group: {
            rules: [
              { ruleType: 'email', predicate: 'ends_on', value: 'newdomain.com' }
            ]
          }
        })
        expect(group.members).to match_array([user1])
      end
    end
  end
end
