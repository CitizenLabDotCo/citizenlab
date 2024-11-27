# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Impact tracking pageview' do
  explanation 'Registers a pageview whenever the user navigates to a new page'

  before do
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/sessions/:id/track_pageview' do
    with_options scope: :pageview do
      parameter :id, 'The id of the session'
      parameter :client_path, 'The path of the pageview'
      parameter :route, 'The route of the pageview'
    end

    let(:id) { create(:session).id }
    let(:project) { create(:project) }

    context 'when path is index' do
      let(:client_path) { '/en/' }
      let(:route) { '/:locale' }

      example 'Track a pageview when a session already exists' do
        do_request
        expect(response_status).to eq 201
        expect(ImpactTracking::Pageview.count).to eq 1
        expect(ImpactTracking::Pageview.last).to have_attributes({
          path: '/en/'
        })
      end

      example 'Reject a pageview when a session does not exists' do
        do_request(id: 'fake-id')
        expect(response_status).to eq 404
        expect(ImpactTracking::Pageview.count).to eq 0
      end
    end

    context 'when path is a project' do
      let(:client_path) { "/en/projects/#{project.slug}" }
      let(:route) { '/:locale/projects/:slug' }

      example 'Derive the project id from project slug' do
        do_request
        expect(response_status).to eq 201
        expect(ImpactTracking::Pageview.last).to have_attributes({
          project_id: project.id
        })
      end
    end

    context 'when path is an idea' do
      let(:idea) { create(:idea, project: project) }
      let(:client_path) { "/en/ideas/#{idea.slug}" }
      let(:route) { '/:locale/ideas/:slug' }

      example 'Derive the project id from idea slug' do
        do_request
        expect(response_status).to eq 201
        expect(ImpactTracking::Pageview.last).to have_attributes({
          project_id: project.id
        })
      end
    end

    context 'when missing route' do
      let(:client_path) { '/en/' }
      let(:route) { nil }

      example 'Track a pageview when a session already exists' do
        do_request
        expect(response_status).to eq 201
        expect(ImpactTracking::Pageview.count).to eq 1
        expect(ImpactTracking::Pageview.last).to have_attributes({
          path: '/en/'
        })
      end
    end
  end
end
