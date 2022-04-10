# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative './shared/publication_filtering_model'

resource 'Topics' do
  explanation 'E.g. mobility, health, culture...'

  before do
    header 'Content-Type', 'application/json'
    @code1, @code2 = Topic.codes.take(2)
    @topics = create_list(:topic, 2, code: @code1) + create_list(:topic, 3, code: @code2)
  end

  get 'web_api/v1/topics' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of topics per page'
    end
    parameter :code, 'Filter by code', required: false

    example_request 'List all topics' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example 'List all topics by code' do
      do_request code: @code1
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end

    example_request 'List all topics by code exclusion' do
      do_request exclude_code: @code1
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end

    example 'List all topics sorted by newest first' do
      t1 = create(:topic, created_at: Time.zone.now + 1.hour)

      do_request sort: 'new'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 6
      expect(json_response[:data][0][:id]).to eq t1.id
    end

    example 'List all topics sorted by custom ordering' do
      t1 = create(:topic)
      t1.insert_at!(0)
      t2 = create(:topic)
      t2.insert_at!(6)

      do_request sort: 'custom'
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 7
      expect(json_response[:data][0][:id]).to eq t1.id
      expect(json_response[:data][6][:id]).to eq t2.id
    end

    context 'when citizen' do
      it_behaves_like 'publication filtering model', 'topic'
    end
  end

  get 'web_api/v1/topics/:id' do
    let(:id) { @topics.first.id }

    example_request 'Get one topic by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @topics.first.id
    end
  end
end
