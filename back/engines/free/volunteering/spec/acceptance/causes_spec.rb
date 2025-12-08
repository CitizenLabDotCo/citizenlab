# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Volunteering Causes' do
  explanation 'Causes are tasks or events users can volunteer for, linked to a volunteering phase'

  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/phases/:phase_id/causes' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of causes per page'
    end

    before do
      @phase = create(:volunteering_phase)
      @causes = create_list(:cause, 3, phase: @phase)
      create(:cause)
    end

    let(:phase_id) { @phase.id }
    example_request 'List all causes in a volunteering phase' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
    end
  end

  get 'web_api/v1/causes/:id' do
    before do
      @cause = create(:cause)
    end

    let(:id) { @cause.id }

    example_request 'Get one cause by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @cause.id
      expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to eq @cause.title_multiloc
      expect(json_response.dig(:data, :attributes, :volunteers_count)).to eq 0
    end
  end

  context 'when admin' do
    before do
      admin_header_token
      @project = create(:single_phase_volunteering_project)
      @causes = create_list(:cause, 3, phase: @project.phases.first)
    end

    post 'web_api/v1/causes' do
      with_options scope: :cause do
        parameter :phase_id, 'The id of the phase the cause belongs to', required: true
        parameter :title_multiloc, 'The cause title, as a multiloc string', required: true
        parameter :description_multiloc, 'The cause description, as a multiloc string. Supports html.', required: false
        parameter :image, 'Base64 encoded image', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Volunteering::Cause)

      let(:cause) { build(:cause) }
      let(:title_multiloc) { cause.title_multiloc }
      let(:description_multiloc) { { 'en' => '<b>This is a fine description</b>' } }
      let(:phase_id) { cause.phase_id }

      example_request 'Create a cause' do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :ordering)).to eq 0
        expect(json_response.dig(:data, :relationships, :phase, :data, :type)).to eq 'phase'
        expect(json_response.dig(:data, :relationships, :phase, :data, :id)).to eq phase_id
      end
    end

    patch 'web_api/v1/causes/:id' do
      with_options scope: :cause do
        parameter :title_multiloc, 'The cause title, as a multiloc string', required: false
        parameter :description_multiloc, 'The cause description, as a multiloc string. Supports html.', required: false
        parameter :image, 'Base64 encoded image', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Volunteering::Cause)

      let(:cause) { create(:cause) }
      let(:id) { cause.id }
      let(:title_multiloc) { { 'en' => 'Shop for your neighbour' } }
      let(:description_multiloc) { { 'en' => "Because it's fun!" } }
      let(:image) { "data:image/png;base64,#{Base64.encode64(Rails.root.join('spec/fixtures/image14.jpg').read)}" }

      example_request 'Update a cause' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :image)).to be_present
      end

      describe do
        example 'The image can be removed' do
          cause.update!(image: Rails.root.join('spec/fixtures/header.jpg').open)
          expect(cause.reload.image_url).to be_present
          do_request cause: { image: nil }
          expect(cause.reload.image_url).to be_nil
        end
      end
    end

    patch 'web_api/v1/causes/:id/reorder' do
      with_options scope: :cause do
        parameter :ordering, 'The position, starting from 0, where the cause should be at. Causes after will move down.', required: true
      end

      let(:id) { @causes.last.id }
      let(:ordering) { 1 }

      example_request 'Reorder a cause' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to match ordering
        expect(Volunteering::Cause.order(:ordering)[1].id).to eq id
        expect(Volunteering::Cause.order(:ordering).map(&:ordering)).to eq (0..2).to_a
      end
    end

    delete 'web_api/v1/causes/:id' do
      let!(:id) { create(:cause).id }

      example 'Delete a cause' do
        old_count = Volunteering::Cause.count
        do_request
        expect(response_status).to eq 200
        expect { Volunteering::Cause.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(Volunteering::Cause.count).to eq(old_count - 1)
      end
    end
  end
end
