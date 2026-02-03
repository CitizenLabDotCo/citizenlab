# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative 'shared/publication_filtering_model'

resource 'GlobalTopics' do
  explanation 'E.g. mobility, health, culture...'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/global_topics' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of global_topics per page'
    end
    parameter :sort, 'Either custom, new, -new, projects_count, -projects_count. Defaults to custom.'

    before do
      @global_topics = create_list(:global_topic, 2) + create_list(:global_topic, 3, include_in_onboarding: true)
    end

    example_request 'List all global_topics' do
      assert_status(200)
      expect(response_data.size).to eq 5
    end

    example 'List all global_topics for onboarding' do
      do_request for_onboarding: true
      assert_status 200
      expect(response_data.size).to eq 3
    end

    example 'List all global_topics sorted by newest first' do
      t1 = create(:global_topic, created_at: 1.hour.from_now)

      do_request sort: 'new'

      expect(response_data.size).to eq 6
      expect(response_data.dig(0, :id)).to eq t1.id
    end

    example 'List all global_topics sorted by custom ordering' do
      t1 = create(:global_topic)
      t1.insert_at!(0)
      t2 = create(:global_topic)
      t2.insert_at!(6)

      do_request sort: 'custom'

      expect(response_data.size).to eq 7
      expect(response_data.dig(0, :id)).to eq t1.id
      expect(response_data.dig(6, :id)).to eq t2.id
    end

    example 'List all global_topics sorted by project count' do
      projects = create_list(:project, 5)
      @global_topics[0].projects_global_topics.create!(project: projects[0])
      @global_topics[0].projects_global_topics.create!(project: projects[2])
      @global_topics[2].projects_global_topics.create!(project: projects[2])
      @global_topics[2].projects_global_topics.create!(project: projects[4])
      @global_topics[2].projects_global_topics.create!(project: projects[3])

      do_request sort: 'projects_count'

      assert_status 200
      expect(response_data.size).to eq 5
      expect(response_data.pluck(:id)).to eq [@global_topics[2].id, @global_topics[0].id, @global_topics[4].id, @global_topics[3].id, @global_topics[1].id]
    end

    context 'when citizen' do
      it_behaves_like 'publication filtering model', 'global_topic'
    end
  end

  get 'web_api/v1/global_topics/:id' do
    let(:global_topic) { create(:global_topic) }
    let(:id) { global_topic.id }

    example_request 'Get one global_topic by ID' do
      assert_status 200
      expect(response_data[:id]).to eq id
    end
  end

  context 'when admin' do
    before { header_token_for user }

    let(:user) { create(:admin) }

    get 'web_api/v1/global_topics/:id' do
      let(:global_topic) { create(:global_topic) }
      let!(:followers) do
        [user, create(:user)].map do |user|
          create(:follower, followable: global_topic, user: user)
        end
      end
      let(:id) { global_topic.id }

      example_request 'Get one global_topic by ID' do
        assert_status 200

        json_response = json_parse response_body
        expect(json_response.dig(:data, :attributes, :followers_count)).to eq 2
        expect(json_response.dig(:data, :relationships, :user_follower, :data, :id)).to eq followers.first.id
      end
    end

    post 'web_api/v1/global_topics' do
      with_options scope: :global_topic do
        parameter :title_multiloc, 'The title of the global_topic, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the global_topic, as a multiloc string', required: false
      end
      ValidationErrorHelper.new.error_fields(self, GlobalTopic)

      let(:global_topic) { build(:global_topic) }
      let(:title_multiloc) { global_topic.title_multiloc }

      example_request 'Create a global_topic' do
        expect(response_status).to eq 201
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch 'web_api/v1/global_topics/:id' do
      with_options scope: :global_topic do
        parameter :title_multiloc, 'The title of the global_topic, as a multiloc string'
        parameter :description_multiloc, 'The description of the global_topic, as a multiloc string'
        parameter :include_in_onboarding, 'Whether or not to include the global_topic in the list presented during onboarding, a boolean'
      end
      ValidationErrorHelper.new.error_fields(self, GlobalTopic)

      let(:global_topic) { create(:global_topic) }
      let(:id) { global_topic.id }
      let(:title_multiloc) { { 'en' => 'Comedy' } }
      let(:description_multiloc) { { 'en' => 'Stuff that tends to make you laugh' } }
      let(:include_in_onboarding) { true }

      example_request 'Update a global_topic' do
        assert_status(200)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(response_data.dig(:attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(response_data.dig(:attributes, :include_in_onboarding)).to be true
      end
    end

    patch 'web_api/v1/global_topics/:id/reorder' do
      with_options scope: :global_topic do
        parameter :ordering, 'The position, starting from 0, where the field should be at. Fields after will move down.', required: true
      end

      let(:id) { create(:global_topic).id }
      let(:ordering) { 1 }

      example_request 'Reorder a global_topic globally' do
        assert_status(200)
        expect(response_data.dig(:attributes, :ordering)).to eq ordering
      end
    end

    delete 'web_api/v1/global_topics/:id' do
      let(:global_topic) { create(:global_topic) }
      let!(:id) { global_topic.id }

      example 'Delete a global_topic' do
        old_count = GlobalTopic.count
        do_request
        assert_status(200)
        expect { GlobalTopic.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(GlobalTopic.count).to eq(old_count - 1)
      end
    end
  end
end
