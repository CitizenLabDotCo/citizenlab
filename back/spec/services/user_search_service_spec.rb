# frozen_string_literal: true

require 'rails_helper'

describe UserSearchService do
  let(:service) { described_class.new }

  describe 'search' do
    it 'finds users by partial first name' do
      tintin = create(:user, first_name: 'Tintin', last_name: 'Reporter')
      create(:user, first_name: 'Haddock', last_name: 'Captain')

      results = service.search('tin')
      expect(results).to contain_exactly(tintin)
    end

    it 'is case insensitive' do
      jommeke = create(:user, first_name: 'Jommeke')

      results = service.search('JO')
      expect(results).to contain_exactly(jommeke)
    end

    it 'finds users with Unicode characters in the query' do
      obelix = create(:user, first_name: 'Øbelix')
      create(:user, first_name: 'Oberon')

      results = service.search('øbe')
      expect(results).to contain_exactly(obelix)
    end

    it 'respects the limit parameter' do
      create_list(:user, 3, first_name: 'Suske')

      results = service.search('suske', limit: 2)
      expect(results.size).to eq 2
    end

    it 'excludes the specified user' do
      suske = create(:user, first_name: 'Suske', last_name: 'Ansen')
      wiske = create(:user, first_name: 'Wiske', last_name: 'Ansen')

      results = service.search('ansen', exclude_user: suske)
      expect(results).to contain_exactly(wiske)
    end

    it 'excludes unregistered users' do
      unregistered = create(:user, first_name: 'Tintin')
      unregistered.update_column(:registration_completed_at, nil)

      results = service.search('tintin')
      expect(results).not_to include(unregistered)
    end

    it 'handles tsquery special characters without raising' do
      tintin = create(:user, first_name: 'Tintin')

      expect { service.search('tin & |!():*') }.not_to raise_error
      expect(service.search('tin & |!():*')).to contain_exactly(tintin)
    end

    it 'excludes blocked users' do
      create(:user, first_name: 'Tintin', block_start_at: 1.week.ago, block_end_at: 1.week.from_now)

      results = service.search('tintin')
      expect(results).to be_empty
    end

    it 'prioritizes idea participants and backfills with other users' do
      non_participant = create(:user, first_name: 'Jommeke', last_name: 'Ansen')
      author = create(:user, first_name: 'Suske', last_name: 'Ansen')
      commenter = create(:user, first_name: 'Wiske', last_name: 'Ansen')
      idea = create(:idea, author: author)
      create(:comment, idea: idea, author: commenter)

      results = service.search('ansen', idea_id: idea.id, limit: 2)
      expect(results).to contain_exactly(author, commenter)

      results = service.search('ansen', idea_id: idea.id, limit: 5)
      expect(results).to contain_exactly(author, commenter, non_participant)
      expect(results.uniq).to eq results
    end

    context 'with moderators_only' do
      let!(:admin) { create(:admin, first_name: 'Haddock', last_name: 'Ansen') }
      let!(:moderator) { create(:project_moderator, first_name: 'Tournesol', last_name: 'Ansen') }
      let!(:regular) { create(:user, first_name: 'Tintin', last_name: 'Ansen') }

      it 'returns only admins and moderators' do
        results = service.search('ansen', moderators_only: true)
        expect(results).to contain_exactly(admin, moderator)
      end

      it 'applies moderator filter to idea participants too' do
        idea = create(:idea, author: regular)
        create(:comment, idea: idea, author: moderator)

        results = service.search('ansen', idea_id: idea.id, moderators_only: true, limit: 5)
        expect(results).to contain_exactly(admin, moderator)
      end
    end
  end
end
