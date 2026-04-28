require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Spaces' do
  explanation 'A space is used to manage a group of projects and folders and the people that can work on them.'

  let(:space1) do
    create(
      :space,
      title_multiloc: { 'en' => 'Space is cool' },
      description_multiloc: { 'en' => 'Space. The final frontier.' }
    )
  end

  let!(:folder) { create(:project_folder, space: space1) }
  let!(:project_in_folder) { create(:project, space: space1, folder: folder) }
  let!(:project_not_in_folder) { create(:project, space: space1) }

  let(:space_id) { space1.id }

  shared_examples 'unauthorized access examples' do
    get 'web_api/v1/spaces/:space_id' do
      example_request '[Unauthorized] Retrieving a space' do
        expect(status).to eq(401)
      end
    end

    get 'web_api/v1/spaces' do
      example_request '[Unauthorized] Retrieving list of spaces' do
        expect(status).to eq(401)
      end
    end

    post 'web_api/v1/spaces' do
      with_options scope: :space do
        parameter :title_multiloc, 'The multiloc title of the space', required: true
        parameter :description_multiloc, 'The multiloc description of the space', required: false
      end

      let(:title_multiloc) { { 'en' => 'New Space' } }
      let(:description_multiloc) { { 'en' => 'Description of the new space.' } }

      example_request 'Creating a space' do
        expect(status).to eq(401)
      end
    end

    patch 'web_api/v1/spaces/:space_id' do
      with_options scope: :space do
        parameter :title_multiloc, 'The multiloc title of the space', required: false
        parameter :description_multiloc, 'The multiloc description of the space', required: false
      end

      let(:title_multiloc) { { 'en' => 'Updated Space Title' } }
      let(:description_multiloc) { { 'en' => 'Updated description of the space.' } }

      example_request 'Updating a space' do
        expect(status).to eq(401)
      end
    end

    delete 'web_api/v1/spaces/:space_id' do
      example_request 'Deleting a space' do
        expect(status).to eq(401)
      end
    end
  end

  before { header 'Content-Type', 'application/json' }

  context 'when admin' do
    before { admin_header_token }

    get 'web_api/v1/spaces/:space_id' do
      example_request 'Retrieving a space' do
        expect(status).to eq(200)
        expect(response_data[:id]).to eq(space1.id)
        expect(response_data[:type]).to eq('space')
        expect(response_data[:attributes]).to include(
          title_multiloc: { en: 'Space is cool' },
          description_multiloc: { en: 'Space. The final frontier.' }
        )

        folder_ids = response_data.dig(:relationships, :folders, :data).map { |folder| folder[:id] }
        expect(folder_ids).to include(folder.id.to_s)

        project_ids = response_data.dig(:relationships, :projects, :data).map { |project| project[:id] }
        expect(project_ids).to include(project_in_folder.id.to_s)
        expect(project_ids).to include(project_not_in_folder.id.to_s)
      end
    end

    get 'web_api/v1/spaces' do
      example 'Retrieving list of spaces' do
        space2 = create(:space)

        do_request

        expect(status).to eq(200)
        expect(response_data.size).to eq(2)
        expect(response_data.map { |s| s[:id] }).to include(space1.id)
        expect(response_data.map { |s| s[:id] }).to include(space2.id)

        space1_data = response_data.find { |s| s[:id] == space1.id }
        expect(space1_data[:type]).to eq('space')
        expect(space1_data[:attributes]).to include(
          title_multiloc: { en: 'Space is cool' },
          description_multiloc: { en: 'Space. The final frontier.' }
        )

        folder_ids = space1_data.dig(:relationships, :folders, :data).map { |folder| folder[:id] }
        expect(folder_ids).to include(folder.id.to_s)

        project_ids = space1_data.dig(:relationships, :projects, :data).map { |project| project[:id] }
        expect(project_ids).to include(project_in_folder.id.to_s)
        expect(project_ids).to include(project_not_in_folder.id.to_s)
      end

      example 'Retrieving list of spaces with search' do
        space2 = create(:space, title_multiloc: { en: 'Blast off!' })
        do_request(search: 'Blast')
        expect(status).to eq(200)
        expect(response_data.size).to eq(1)
        expect(response_data.first[:id]).to eq(space2.id)
      end
    end

    post 'web_api/v1/spaces' do
      with_options scope: :space do
        parameter :title_multiloc, 'The multiloc title of the space', required: true
        parameter :description_multiloc, 'The multiloc description of the space', required: false
      end

      let(:title_multiloc) { { 'en' => 'New Space' } }
      let(:description_multiloc) { { 'en' => 'Description of the new space.' } }

      example_request 'Creating a space' do
        expect(status).to eq(201)
        expect(response_data[:attributes]).to include(
          title_multiloc: { en: 'New Space' },
          description_multiloc: { en: 'Description of the new space.' }
        )
      end
    end

    patch 'web_api/v1/spaces/:space_id' do
      with_options scope: :space do
        parameter :title_multiloc, 'The multiloc title of the space', required: false
        parameter :description_multiloc, 'The multiloc description of the space', required: false
      end

      let(:title_multiloc) { { 'en' => 'Updated Space Title' } }
      let(:description_multiloc) { { 'en' => 'Updated description of the space.' } }

      example_request 'Updating a space' do
        expect(status).to eq(200)
        expect(response_data[:attributes]).to include(
          title_multiloc: { en: 'Updated Space Title' },
          description_multiloc: { en: 'Updated description of the space.' }
        )
      end
    end

    delete 'web_api/v1/spaces/:space_id' do
      example_request 'Deleting a space' do
        expect(status).to eq(204)
        expect(Space.where(id: space1.id)).to be_empty
      end

      example 'Deleting a space also strips space_moderator roles from its moderators' do
        create_list(:space_moderator, 3, spaces: [space1])
        expect(User.space_moderator(space1.id).count).to eq 3

        do_request

        expect(status).to eq(204)
        expect(Space.where(id: space1.id)).to be_empty
        expect(User.space_moderator(space1.id).count).to eq 0
      end
    end
  end

  context 'when visitor' do
    include_examples 'unauthorized access examples'
  end

  context 'when normal user' do
    before { resident_header_token }

    include_examples 'unauthorized access examples'
  end

  # TODO: Insert tests when role is implemented
  # context 'space manager (moderator)' do
  # end

  context 'project moderator' do
    before do
      project_moderator = create(:project_moderator)
      header_token_for(project_moderator)
    end

    include_examples 'unauthorized access examples'
  end

  context 'folder moderator' do
    before do
      folder_moderator = create(:project_folder_moderator)
      header_token_for(folder_moderator)
    end

    include_examples 'unauthorized access examples'
  end
end
