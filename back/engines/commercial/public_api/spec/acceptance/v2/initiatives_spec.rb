# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Posts' do
  # NOTE: Same name as in ideas_spec to combine the documentation into the same section
  explanation <<~DESC.squish
    Posts are written inputs created by citizens. These can be ideas, initiatives
    (proposals), or survey responses.
  DESC

  include_context 'common_auth'

  let!(:initiatives) { create_list(:initiative, 5, created_at: '2020-01-01') }

  get '/api/v2/initiatives/' do
    route_summary 'List initiatives'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the initiatives in the platform, with the most
      recent ones appearing first.
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of initiatives' do
      let(:page_size) { 2 }

      example_request 'List only the first initiatives' do
        assert_status 200
        expect(json_response_body[:initiatives].size).to eq(page_size)

        total_pages = (initiatives.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :initiative, :created_at
    include_examples 'filtering_by_date', :initiative, :updated_at
  end

  get '/api/v2/initiatives/:id' do
    route_summary 'Get initiative (proposal)'
    route_description 'Retrieve a single initiative (proposal) by its ID.'

    include_context 'common_item_params'

    let(:initiative) { initiatives.first }
    let(:id) { initiative.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the initiative.
      title = initiative[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      initiative.update!(title_multiloc: title)
    end

    example_request 'Return the initiative in the default locale' do
      assert_status 200
      expect(json_response_body[:initiative]).to include({ id: id })
    end

    context 'when requesting the initiative in a specific locale' do
      let(:locale) { 'nl-NL' }

      example_request 'Return the initiative in the requested locale', document: false do
        assert_status 200
        expect(json_response_body.dig(:initiative, :title))
          .to eq initiative.title_multiloc['nl-NL']
      end
    end

    context 'when initiative is successful' do
      create(:initiative_status_threshold_reached)
      settings = AppConfiguration.instance.settings
      settings['initiatives']['reacting_threshold'] = 1
      AppConfiguration.instance.update! settings: settings

      create_list(:reaction, 2, reactable: initiative, mode: 'up')
      InitiativeStatusService.new.automated_transitions!

      # expect(@initiative.reload.initiative_status.code).to eq 'threshold_reached'


      example_request 'Return the initiative with successful date', document: false do
        assert_status 200

        binding.pry
      end
    end

  end

  include_examples '/api/v2/.../deleted', :initiatives
end
