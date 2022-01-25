require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "AdminPublication" do

  explanation "Describes the presentation (ordering and publication) of a folder or project"

  before do
    header "Content-Type", "application/json"
  end

  context 'when admin' do
    before do
      admin_header_token

      @projects = %w[published published draft draft published archived archived published]
                  .map { |ps|  create(:project, admin_publication_attributes: { publication_status: ps }) }

      next unless CitizenLab.ee?

      @folder = create(:project_folder, projects: @projects.take(3))
      @empty_draft_folder = create(:project_folder, admin_publication_attributes: {publication_status: 'draft'})
    end

    get "web_api/v1/admin_publications" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of projects per page"
      end
      parameter :depth, 'Filter by depth (AND)', required: false
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, "Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default", required: false
      if CitizenLab.ee?
        parameter :folder, "Filter by folder (project folder id)", required: false
        parameter :remove_childless_parents, 'Use the visibility rules of children on the parent and remove the empty ones', required: false
        parameter :remove_not_allowed_parents, 'Exclude children with parent', required: false
      end

      example_request "List all admin publications" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response[:data].size).to eq 10
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 8
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('folder')).to eq 2
        else
          expect(json_response[:data].size).to eq 8
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 8
        end
      end

      example "List all top-level admin publications" do
        do_request(depth: 0)
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response[:data].size).to eq 7
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 5
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('folder')).to eq 2
        else
          expect(json_response[:data].size).to eq 8
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 8
        end
      end

      if CitizenLab.ee?
        example "List all admin publications in a folder" do
          do_request(folder: @folder.id)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('folder')).to eq 0
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 3
        end
      end

      example "List all draft or archived admin publications" do
        do_request(publication_statuses: ['draft','archived'])
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response[:data].size).to eq 5
          expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :id) }).to match_array [@empty_draft_folder.id, @projects[2].id, @projects[3].id, @projects[5].id, @projects[6].id]
          expect(json_response[:data].select{|d| d.dig(:relationships, :publication, :data, :type) == 'folder'}.first.dig(:attributes, :visible_children_count)).to eq 0
        else
          expect(json_response[:data].size).to eq 4
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 4
        end
      end

      example "List all admin publications with the specified areas (i.e. given an array of areas);" do
        a1 = create(:area)
        a2 = create(:area)

        p1 = @projects[4]
        p1.areas << a1
        p1.save!

        p2 = @projects.last
        p2.areas << a2
        p2.save!

        do_request areas: [a1.id]
        json_response = json_parse(response_body)

        if CitizenLab.ee?
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :id) }).to match_array [@empty_draft_folder.id, @folder.id, @projects[4].id]
        else
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :id) }).not_to include @projects.last.id
        end
      end

      if CitizenLab.ee?
        example "List admin publications representing folders that contain project(s) with the specified areas" do
          a1 = create(:area)
          a2 = create(:area)

          p1 = @projects[0]
          p1.areas << a1
          p1.save!

          do_request(areas: [a1.id], remove_childless_parents: true)

          expect(response_data.map { |d| d.dig(:relationships, :publication, :data, :id) }).to include @folder.id
        end

        example "Don't list admin publications representing folders that don't contain any project(s) with the specified areas" do
          a1 = create(:area)
          a2 = create(:area)

          @folder.projects.each {|p| p.update(areas: [a1]) }

          do_request(areas: [a2.id], remove_childless_parents: true)

          expect(response_data.map { |d| d.dig(:relationships, :publication, :data, :id) }).not_to include @folder.id
        end
      end

      example "List all admin publications with a topic" do
        t1 = create(:topic)

        p1 = @projects[4]
        p1.topics << t1
        p1.save!

        do_request topics: [t1.id]
        json_response = json_parse(response_body)
        if CitizenLab.ee?
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :id) }).to match_array [@empty_draft_folder.id, @folder.id, p1.id]
        else
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data].map { |d| d.dig(:relationships, :publication, :data, :id) }).to match_array [p1.id]
        end
      end
    end

    patch "web_api/v1/admin_publications/:id/reorder" do
      with_options scope: :admin_publication do
        parameter :ordering, "The position, starting from 0, where the folder or project should be at. Publications after will move down.", required: true
      end

      let(:id) { AdminPublication.find_by(ordering: 2).id }
      let(:ordering) { 1 }

      if CitizenLab.ee?
        example "Reorder an admin publication" do
          old_second_project = AdminPublication.find_by(ordering: ordering)
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :ordering)).to eq ordering
          expect(json_response.dig(:data, :id)).to eq id
          expect(AdminPublication.where(ordering: ordering).ids).to include id
          expect(old_second_project.reload.ordering).to eq 2 # previous second is now third
        end
      end
    end

    get "web_api/v1/admin_publications/:id" do
      let(:id) { @projects.first.admin_publication.id }

      example_request "Get one admin publication by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)

        expect(json_response.dig(:data, :id)).to eq @projects.first.admin_publication.id
        expect(json_response.dig(:data, :relationships, :publication, :data, :type)).to eq 'project'
        expect(json_response.dig(:data, :relationships, :publication, :data, :id)).to eq @projects.first.id
        expect(json_response.dig(:data, :attributes, :publication_slug)).to eq @projects.first.slug
      end
    end

    get 'web_api/v1/admin_publications/status_counts' do
      example 'Get publication_status counts for top-level admin publications' do
        do_request(depth: 0)
        expect(status).to eq 200

        json_response = json_parse(response_body)

        expect(json_response[:status_counts][:draft]).to eq 2
        expect(json_response[:status_counts][:archived]).to eq 2

        if CitizenLab.ee?
          expect(json_response[:status_counts][:published]).to eq 3
        else
          expect(json_response[:status_counts][:published]).to eq 4
        end
      end
    end
  end

  context 'when citizen' do
    before do
      user_header_token

      @projects = ['published','published','draft','draft','published','archived']
        .map { |ps|  create(:project, admin_publication_attributes: {publication_status: ps})}

      next unless CitizenLab.ee?

      @folder = create(:project_folder, projects: @projects.take(3))
      @empty_draft_folder = create(:project_folder, admin_publication_attributes: {publication_status: 'draft'})
    end

    get "web_api/v1/admin_publications" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of projects per page"
      end
      parameter :topics, 'Filter by topics (AND)', required: false
      parameter :areas, 'Filter by areas (AND)', required: false
      parameter :publication_statuses, "Return only publications with the specified publication statuses (i.e. given an array of publication statuses); always includes folders; returns all publications by default", required: false
      parameter :filter_empty_folders, "Filter out folders with no visible children for the current user", required: false
      if CitizenLab.ee?
        parameter :folder, "Filter by folder (project folder id)", required: false
      end

      if !CitizenLab.ee?
        example "Listed admin publications have correct visible children count", document: false do
          do_request
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 4
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 4
        end
      end

      if CitizenLab.ee?
        example "Listed admin publications have correct visible children count", document: false do
          do_request(folder: nil)
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('folder')).to eq 1
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 2
          expect(json_response[:data].select{|d| d.dig(:relationships, :publication, :data, :type) == 'folder'}.first.dig(:attributes, :visible_children_count)).to eq 2
        end

        example "Visible children count should take account with applied filters", document: false do
          @projects.first.admin_publication.update! publication_status: 'archived'
          do_request(folder: nil, publication_statuses: ['published'])
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('folder')).to eq 1
          expect(json_response[:data].map{|d| d.dig(:relationships, :publication, :data, :type)}.count('project')).to eq 1
          expect(json_response[:data].select{|d| d.dig(:relationships, :publication, :data, :type) == 'folder'}.first.dig(:attributes, :visible_children_count)).to eq 1
        end
      end

      example "Returns an empty list success response when there are no publications", document: false do
        AdminPublication.publication_types.each{|claz| claz.all.each(&:destroy!)}
        do_request(publication_statuses: ['published'])
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 0
      end
    end
  end

  context 'when not logged in' do
    before do
      @projects = %w[published archived draft published archived]
                  .map { |ps|  create(:project, admin_publication_attributes: { publication_status: ps }) }

      next unless CitizenLab.ee?

      @folder = create(:project_folder, projects: @projects.take(2))
      @empty_draft_folder = create(:project_folder, admin_publication_attributes: { publication_status: 'draft' })
    end

    get 'web_api/v1/admin_publications/status_counts' do
      example 'Get publication_status counts for top-level admin publications' do
        do_request(depth: 0)
        expect(status).to eq 200

        json_response = json_parse(response_body)
        expect(json_response[:status_counts][:draft]).to eq nil
        expect(json_response[:status_counts][:published]).to eq 2

        if CitizenLab.ee?
          expect(json_response[:status_counts][:archived]).to eq 1
        else
          expect(json_response[:status_counts][:archived]).to eq 2
        end
      end
    end
  end
end
