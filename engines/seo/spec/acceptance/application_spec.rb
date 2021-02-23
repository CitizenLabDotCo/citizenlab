require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'SEO' do
  explanation 'Exposes the sitemap, ok computer, and robots endpoints.'

  get '/sitemap.xml' do
    let(:sitemap) { Nokogiri::XML(response_body) }
    let(:locales_count) { AppConfiguration.instance.settings.dig('core', 'locales').count }
    let(:base_count) { 12 }
    let(:url_count_per_project) { 3 }
    let(:url_count_per_idea) { 1 }

    before do
      header 'Content-Type', 'application/xml'
    end

    context 'when the platform has no resources' do
      before do
        do_request
      end

      example 'successfully returns the sitemap' do
        expect(response_status).to eq 200
      end

      example 'the sitemap has the right number of items' do
        expect(sitemap.search('url').count).to eq base_count
      end
    end

    context 'when the platform has some projects' do
      let(:project_count) { 2 }

      before do
        create_list(:project, project_count, process_type: 'continuous')
        do_request
      end

      example 'successfully returns the sitemap' do
        expect(response_status).to eq 200
      end

      example 'the sitemap has the right number of items' do
        expected_count = base_count + (project_count * url_count_per_project * locales_count)
        expect(sitemap.search('url').count).to eq expected_count
      end
    end

    context 'when the platform has some ideas' do
      let(:idea_count) { 2 }
      let(:project_count) { 1 }

      before do
        create_list(:project, project_count, process_type: 'continuous')
        create_list(:idea, idea_count, project: Project.first)
        do_request
      end

      example 'successfully returns the sitemap' do
        expect(response_status).to eq 200
      end

      example 'the sitemap has the right number of items' do
        expected_count = base_count +
                         (idea_count    * url_count_per_idea    * locales_count) +
                         (project_count * url_count_per_project * locales_count)
        expect(sitemap.search('url').count).to eq expected_count
      end
    end
  end

  get '/okcomputer' do
    before do
      header 'Content-Type', 'application/json'
    end

    example_request 'successfully returns an ok status' do
      expect(response_status).to eq 200
    end
  end

  get '/robots.txt' do
    before do
      header 'Content-Type', 'text/plain'
    end

    example_request 'successfully the robots file with the url for the sitemap' do
      expect(response_status).to eq 200
      expect(response_body).to include 'sitemap.xml'
    end
  end
end
