require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "AdminPublication" do

  explanation "Describes the presentation (ordering and publication) of a folder or project"

  before do
    header "Content-Type", "application/json"
  end

  context 'when project folder moderator' do
    let(:folder) { create(:project_folder) }

    before do
      @user = create(:project_folder_moderator, project_folder: folder)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"

      @projects = ['published','published','draft','draft','published','archived','archived','published']
        .map { |ps|  create(:project, admin_publication_attributes: {publication_status: ps, parent_id: folder.admin_publication.id })}
      @folder = create(:project_folder, projects: @projects.take(3))
      @empty_draft_folder = create(:project_folder, admin_publication_attributes: {publication_status: 'draft'})
    end

    patch "web_api/v1/admin_publications/:id/reorder" do
      with_options scope: :admin_publication do
        parameter :ordering, "The position, starting from 0, where the folder or project should be at. Publications after will move down.", required: true
      end

      describe do
        # getting the first publication, which should have ordering = 0
        let(:publication) { folder.admin_publication.children.first }
        let(:id) { publication.id }
        let(:publication_ordering) { 0 }

        let(:ordering) { 1 }

        # getting the second publication, which should have ordering = 1
        let(:second_publication) { folder.admin_publication.children.second }
        let(:second_publication_ordering) { 1 }

        before do
          expect(publication.ordering).to eq publication_ordering
          expect(second_publication.ordering).to eq second_publication_ordering
        end

        example 'Reorder an admin publication' do
          do_request
          new_ordering = json_parse(response_body).dig(:data, :attributes, :ordering)

          expect(response_status).to eq 200
          expect(new_ordering).to eq second_publication_ordering
          expect(second_publication.reload.ordering).to eq publication_ordering
        end
      end
    end
  end
end
