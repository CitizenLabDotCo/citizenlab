# frozen_string_literal: true

RSpec.shared_examples 'publication filtering model' do |model_name|
  with_options scope: :page do
    parameter :number, 'Page number'
    parameter :size, 'Number of areas per page'
  end

  describe '`for_homepage_filter` parameter' do
    parameter :for_homepage_filter, 'Filter: areas of only visible non-draft projects not in draft folders', required: false

    model_name_plural = model_name.to_s.pluralize

    before { resident_header_token }

    let(:models) { create_list(model_name, 4) }
    let(:topic_projects) do
      %w[published archived published].map.with_index do |status, index|
        create(:project, admin_publication_attributes: { publication_status: status }, model_name_plural => [models[index]])
      end
    end

    example "List only selected #{model_name_plural} does not include #{model_name_plural} only used by draft projects" do
      topic_projects[0].update!(admin_publication_attributes: { publication_status: 'draft' })

      do_request(for_homepage_filter: true)
      expect(status).to eq(200)
      expect(response_data.pluck(:id)).to contain_exactly(models[1].id, models[2].id)
    end

    example "List only selected #{model_name_plural} does not include #{model_name_plural} only used by projects in draft folders" do
      create(:project_folder, projects: topic_projects[0])
      create(:project_folder, admin_publication_attributes: { publication_status: 'draft' }, projects: topic_projects[1])

      do_request(for_homepage_filter: true)
      expect(status).to eq(200)
      expect(response_data.pluck(:id)).to contain_exactly(models[0].id, models[2].id)
    end

    example "List only selected #{model_name_plural} does not include #{model_name_plural} only used by projects not visible to user" do
      group = create(:group)
      create(:groups_project, group_id: group.id, project_id: topic_projects[0].id)

      topic_projects[0].update!(visible_to: 'groups')
      topic_projects[1].update!(visible_to: 'admins')

      do_request(for_homepage_filter: true)
      expect(status).to eq(200)
      expect(response_data.pluck(:id)).to contain_exactly(models[2].id)
    end
  end
end
