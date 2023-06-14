# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative './shared/publication_filtering_model'

resource 'Topics' do
  explanation 'E.g. mobility, health, culture...'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/topics' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of topics per page'
    end
    parameter :code, 'Filter by code', required: false

    before do
      @code1, @code2 = Topic::CODES.take(2)
      @topics = create_list(:topic, 2, code: @code1) + create_list(:topic, 3, code: @code2)
    end

    example_request 'List all topics' do
      assert_status(200)
      expect(response_data.size).to eq 5
    end

    example 'List all topics by code' do
      do_request code: @code1
      assert_status(200)
      expect(response_data.size).to eq 2
    end

    example_request 'List all topics by code exclusion' do
      do_request exclude_code: @code1
      assert_status(200)
      expect(response_data.size).to eq 3
    end

    example 'List all topics sorted by newest first' do
      t1 = create(:topic, created_at: 1.hour.from_now)

      do_request sort: 'new'

      expect(response_data.size).to eq 6
      expect(response_data.dig(0, :id)).to eq t1.id
    end

    example 'List all topics sorted by custom ordering' do
      t1 = create(:topic)
      t1.insert_at!(0)
      t2 = create(:topic)
      t2.insert_at!(6)

      do_request sort: 'custom'

      expect(response_data.size).to eq 7
      expect(response_data.dig(0, :id)).to eq t1.id
      expect(response_data.dig(6, :id)).to eq t2.id
    end

    context 'when citizen' do
      it_behaves_like 'publication filtering model', 'topic'
    end
  end

  get 'web_api/v1/topics/:id' do
    let(:topic) { create(:topic) }
    let(:id) { topic.id }

    example_request 'Get one topic by id' do
      assert_status(200)
      expect(response_data[:id]).to eq(id)
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/topics' do
      with_options scope: :topic do
        parameter :title_multiloc, 'The title of the topic, as a multiloc string', required: true
        parameter :description_multiloc, 'The description of the topic, as a multiloc string', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Topic)

      let(:topic) { build(:topic) }
      let(:title_multiloc) { topic.title_multiloc }

      example_request 'Create a topic' do
        expect(response_status).to eq 201
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch 'web_api/v1/topics/:id' do
      with_options scope: :topic do
        parameter :title_multiloc, 'The title of the topic, as a multiloc string'
        parameter :description_multiloc, 'The description of the topic, as a multiloc string'
      end
      ValidationErrorHelper.new.error_fields(self, Topic)

      let(:topic) { create(:custom_topic) }
      let(:id) { topic.id }
      let(:title_multiloc) { { 'en' => 'Comedy' } }
      let(:description_multiloc) { { 'en' => 'Stuff that tends to make you laugh' } }

      example_request 'Update a topic' do
        assert_status(200)
        expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(response_data.dig(:attributes, :description_multiloc).stringify_keys).to match description_multiloc
      end

      context do
        let(:topic) { create(:custom_topic, code: 'mobility', title_multiloc: { 'en' => 'Drama' }) }
        let(:id) { topic.id }

        example_request 'Rename a default topic does not work', example: false do
          assert_status(200)
          expect(response_data.dig(:attributes, :title_multiloc).stringify_keys).to match({ 'en' => 'Drama' })
        end
      end
    end

    patch 'web_api/v1/topics/:id/reorder' do
      with_options scope: :topic do
        parameter :ordering, 'The position, starting from 0, where the field should be at. Fields after will move down.', required: true
      end

      let(:id) { create(:topic).id }
      let(:ordering) { 1 }

      example_request 'Reorder a topic globally' do
        assert_status(200)
        expect(response_data.dig(:attributes, :ordering)).to eq ordering
      end

      context do
        let(:topic) { create(:topic, code: 'mobility') }
        let(:id) { topic.id }

        example_request 'Reorder a default topic' do
          assert_status(200)
        end
      end
    end

    delete 'web_api/v1/topics/:id' do
      let(:topic) { create(:custom_topic) }
      let!(:id) { topic.id }

      example 'Delete a topic' do
        old_count = Topic.count
        do_request
        assert_status(200)
        expect { Topic.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Topic.count).to eq(old_count - 1)
      end

      context do
        let(:topic) { create(:topic, code: 'mobility') }
        let(:id) { topic.id }

        example_request '[error] Delete a default topic' do
          assert_status(401)
        end
      end
    end
  end
end
