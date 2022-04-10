RSpec.shared_examples 'publication filtering model' do |model_name|
  with_options scope: :page do
    parameter :number, 'Page number'
    parameter :size, 'Number of areas per page'
  end

  describe '`for_homepage_filter` parameter' do
    parameter :for_homepage_filter, 'Filter: areas of only visible non-draft projects not in draft folders', required: false

    model_name_plural = model_name.to_s.pluralize

    before { user_header_token }

    let(:models) { create_list(model_name, 4) }
    let(:projects) do
      %w[published archived published].map.with_index do |status, index|
        create(:project, admin_publication_attributes: { publication_status: status }, model_name_plural => [models[index]])
      end
    end

    example "List only selected #{model_name_plural} does not include #{model_name_plural} only used by draft projects" do
      projects[0].update!(admin_publication_attributes: { publication_status: 'draft' })

      do_request(for_homepage_filter: true)
      expect(status).to eq(200)
      expect(response_data.pluck(:id)).to match_array [models[1].id, models[2].id]
    end

    if CitizenLab.ee?
      example "List only selected #{model_name_plural} does not include #{model_name_plural} only used by projects in draft folders" do
        create(:project_folder, projects: projects[0])
        create(:project_folder, admin_publication_attributes: { publication_status: 'draft' }, projects: projects[1])

        do_request(for_homepage_filter: true)
        expect(status).to eq(200)
        expect(response_data.pluck(:id)).to match_array [models[0].id, models[2].id]
      end
    end

    example "List only selected #{model_name_plural} does not include #{model_name_plural} only used by projects not visible to user" do
      group = create(:group)
      create(:groups_project, group_id: group.id, project_id: projects[0].id)

      projects[0].update!(visible_to: 'groups')
      projects[1].update!(visible_to: 'admins')

      do_request(for_homepage_filter: true)
      expect(status).to eq(200)
      expect(response_data.pluck(:id)).to match_array [models[2].id]
    end
  end
end
