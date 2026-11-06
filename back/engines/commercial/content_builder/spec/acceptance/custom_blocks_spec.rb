# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'CustomBlocks' do
  explanation <<~DESC
    Page builder blocks whose React code is written by the report generation loop.

    A layout pins the version it renders, so these are the only two reads a placed
    block performs: the version's metadata, and its compiled bundle.
  DESC

  before do
    set_api_content_type
    SettingsService.new.activate_feature!('llm_reporting')
  end

  get 'web_api/v1/custom_blocks/:custom_block_id/versions/:number' do
    let(:custom_block) { create(:custom_block, :published) }
    let(:custom_block_id) { custom_block.id }
    let(:version) { custom_block.versions.first }
    let(:number) { version.number }

    example_request 'Get one version of a published custom block' do
      assert_status 200

      expect(response_data).to include(id: version.id, type: 'custom_block_version')
      expect(response_data[:attributes].keys).to match_array(
        %i[number sdk_version manifest messages created_at block_title_multiloc block_status]
      )
      expect(response_data[:attributes]).to include(
        number: 1,
        sdk_version: 'v1',
        block_status: 'published'
      )
      expect(response_data[:attributes][:manifest]).to include(targets: ['report'])
    end

    example_request 'Neither the source nor the bundle is exposed', document: false do
      expect(response_body).not_to include version.source
      expect(response_body).not_to include version.bundle
    end

    example 'Get a specific version rather than the newest', document: false do
      create(:custom_block_version, custom_block: custom_block)

      do_request(number: 1)

      assert_status 200
      expect(response_data[:attributes][:number]).to eq 1
    end

    context 'when the version does not exist' do
      let(:number) { 99 }

      example_request '[error] Try to get a version that was never written' do
        assert_status 404
      end
    end

    context 'when the block is a draft' do
      let(:custom_block) { create(:custom_block) }
      let(:version) { create(:custom_block_version, custom_block: custom_block) }

      example_request '[error] Try to get a draft version as a visitor' do
        assert_status 401
      end

      context 'when admin' do
        before { admin_header_token }

        example_request 'Get a draft version as an admin' do
          assert_status 200
          expect(response_data[:attributes][:block_status]).to eq 'draft'
        end
      end
    end

    context 'when the feature is not activated' do
      before { SettingsService.new.deactivate_feature!('llm_reporting') }

      example_request '[error] Try to get a version while the feature is off' do
        assert_status 401
      end
    end
  end

  get 'web_api/v1/custom_blocks/:custom_block_id/versions/:number/bundle' do
    let(:custom_block) { create(:custom_block, :published) }
    let(:custom_block_id) { custom_block.id }
    let(:version) { custom_block.versions.first }
    let(:number) { version.number }

    example_request 'Get the compiled bundle of a version of a published custom block' do
      assert_status 200

      expect(response_headers['Content-Type']).to include 'text/javascript'
      expect(response_headers['Cache-Control']).to include 'immutable'
      expect(response_headers['Cache-Control']).to include 'max-age=31536000'
      expect(response_body).to eq version.bundle
    end

    context 'when the block is not published' do
      let(:custom_block) { create(:custom_block) }
      let(:version) { create(:custom_block_version, custom_block: custom_block) }

      example_request '[error] Try to get the bundle of a draft custom block as a visitor' do
        assert_status 401
      end
    end

    context 'when the feature is not activated' do
      before { SettingsService.new.deactivate_feature!('llm_reporting') }

      example_request '[error] Try to get the bundle while the feature is not activated' do
        assert_status 401
      end
    end
  end
end
