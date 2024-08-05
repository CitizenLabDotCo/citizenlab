# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'IdeaStatuses' do
  explanation 'Input statuses reflect the cities attitude towards an input. There are two global sets of input statuses that can be customized: one for ideation and one for proposals.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/idea_statuses' do
    parameter :participation_method, 'Filter by participation method. Either "ideation" or "proposals".', required: false

    before_all do
      create_list(:idea_status, 3)
      create_list(:proposals_status, 2)
    end

    context 'when visitor' do
      let(:participation_method) { 'ideation' }

      example_request 'List all ideation input statuses' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
        expect(json_response[:data].all? { |status| status.dig(:attributes, :participation_method) == 'ideation' }).to be true
      end
    end

    context 'when resident' do
      before { resident_header_token }

      let(:participation_method) { 'proposals' }

      example_request 'List all proposals input statuses' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].all? { |status| status.dig(:attributes, :participation_method) == 'proposals' }).to be true
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all input statuses' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
      end
    end
  end

  get 'web_api/v1/idea_statuses/:id' do
    let(:id) { create(:proposals_status, code: 'custom').id }

    context 'when visitor' do
      example_request 'Get one proposals status by ID' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
        expect(json_response.dig(:data, :attributes, :code)).to eq 'custom'
        expect(json_response.dig(:data, :attributes, :can_reorder)).to be true
        expect(json_response.dig(:data, :attributes, :can_transition_manually)).to be true
      end
    end

    context 'when admin' do
      before { admin_header_token }

      let(:id) { create(:idea_status, code: 'proposed').id }

      example 'Get one idea status by ID', document: false do
        do_request
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
        expect(json_response.dig(:data, :attributes, :code)).to eq 'proposed'
        expect(json_response.dig(:data, :attributes, :can_reorder)).to be false
        expect(json_response.dig(:data, :attributes, :can_transition_manually)).to be true
      end
    end
  end

  post 'web_api/v1/idea_statuses' do
    with_options scope: :idea_status do
      parameter :title_multiloc, 'Multi-locale field for the input status title', required: true
      parameter :description_multiloc, 'Multi-locale field for the input status description', required: true
      parameter :color, 'The hexadecimal color code of this input status\'s label.', required: true
      parameter :code, 'A snake_case value to help us identify the lifecycle status of the input', required: true
      parameter :participation_method, 'Either "ideation" (default) or "proposals"', required: false
    end

    let(:code) { 'rejected' }
    let(:title_multiloc) { { 'en' => 'Inappropriate' } }
    let(:description_multiloc) { { 'en' => 'Custom description' } }
    let(:color) { '#767676' }

    context 'when visitor' do
      example '[Error] Cannot create an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Create an idea status' do
        assert_status 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).not_to be_empty
        expect(json_response.dig(:data, :attributes, :participation_method)).to eq 'ideation'
        expect(json_response.dig(:data, :attributes, :code)).to eq 'rejected'
        expect(json_response.dig(:data, :attributes, :title_multiloc)).to eq({ en: 'Inappropriate' })
        expect(json_response.dig(:data, :attributes, :description_multiloc)).to eq({ en: 'Custom description' })
        expect(json_response.dig(:data, :attributes, :color)).to eq '#767676'
      end

      describe do
        let(:participation_method) { 'proposals' }
        let(:code) { 'custom' }

        example 'Create a proposals status' do
          expect { do_request }.to have_enqueued_job(LogActivityJob).with(kind_of(IdeaStatus), 'created', kind_of(User), kind_of(Integer))

          assert_status 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).not_to be_empty
          expect(json_response.dig(:data, :attributes, :participation_method)).to eq 'proposals'
          expect(json_response.dig(:data, :attributes, :code)).to eq 'custom'
          expect(json_response.dig(:data, :attributes, :title_multiloc)).to eq({ en: 'Inappropriate' })
          expect(json_response.dig(:data, :attributes, :description_multiloc)).to eq({ en: 'Custom description' })
          expect(json_response.dig(:data, :attributes, :color)).to eq '#767676'
        end

        describe do
          let(:code) { 'proposed' }

          example '[Error] Cannot create a proposed status', document: false do
            expect { do_request }.not_to change(IdeaStatus, :count)
            assert_status 422
            expect(json_parse(response_body).dig(:errors, :code)).to eq [{ error: 'blank' }, { error: 'inclusion', value: nil }]
          end
        end
      end
    end
  end

  patch 'web_api/v1/idea_statuses/:id' do
    let(:idea_status) { create(:idea_status) }
    let(:id) { idea_status.id }

    with_options scope: :idea_status do
      parameter :title_multiloc, 'Multi-locale field for the input status title'
      parameter :description_multiloc, 'Multi-locale field for the input status description'
      parameter :color, 'The hexadecimal color code of this input status\'s label.'
      parameter :code, 'A snake_case value to help us identify the lifecycle status of the input'
    end

    let(:title_multiloc) { { 'en' => 'Changed title' } }
    let(:description_multiloc) { { 'en' => 'Changed description' } }
    let(:color) { '#AABBCC' }
    let(:code) { 'rejected' }

    context 'when resident' do
      before { resident_header_token }

      example '[Error] Cannot update an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example 'Update an idea status by ID' do
        expect { do_request }.to have_enqueued_job(LogActivityJob).with(idea_status, 'changed', kind_of(User), idea_status.reload.updated_at.to_i)
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq id
        expect(json_response.dig(:data, :attributes, :title_multiloc)).to eq({ en: 'Changed title' })
        expect(json_response.dig(:data, :attributes, :description_multiloc)).to eq({ en: 'Changed description' })
        expect(json_response.dig(:data, :attributes, :color)).to eq '#AABBCC'
        expect(json_response.dig(:data, :attributes, :code)).to eq 'rejected'
      end

      describe do
        let(:idea_status) { create(:idea_status_proposed) }

        example '[Error] Cannot update the code of a proposed status', document: false do
          do_request
          expect(idea_status.reload.code).to eq 'proposed'
        end
      end

      describe do
        let(:idea_status) { create(:proposals_status) }
        let(:code) { 'expired' }

        example '[Error] Cannot change the code to an automatic status code', document: false do
          do_request
          expect(idea_status.reload.code).not_to eq 'expired'
        end
      end
    end
  end

  patch 'web_api/v1/idea_statuses/:id/reorder' do
    with_options scope: :idea_status do
      parameter :ordering, 'The position, starting from 0, where the status should be at. Fields after will move down.', required: true
    end

    before { create_list(:idea_status, 3) }

    let(:idea_status) { create(:idea_status) }
    let(:id) { idea_status.id }
    let(:ordering) { 1 }

    context 'when resident' do
      before { resident_header_token }

      example '[Error] Cannot reorder an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example 'Reorder an idea status' do
        expect { do_request }.to have_enqueued_job(LogActivityJob).with(idea_status, 'changed', kind_of(User), idea_status.reload.updated_at.to_i)
        assert_status 200
        expect(response_data.dig(:attributes, :ordering)).to eq ordering
      end

      describe do
        let(:idea_status) { create(:idea_status_proposed) }

        example '[Error] Cannot reorder the proposed status', document: false do
          do_request
          assert_status 401
        end
      end

      describe do
        let(:idea_status) { create(:proposals_status, code: 'answered') }

        example 'Reorder a manual default proposals status', document: false do
          do_request
          assert_status 200
          expect(response_data.dig(:attributes, :ordering)).to eq ordering
        end
      end

      describe do
        let(:idea_status) { create(:proposals_status, code: 'threshold_reached') }

        example '[Error] Cannot reorder an automated status status', document: false do
          do_request
          assert_status 401
        end
      end

      describe do
        before do
          IdeaStatus.all.zip(%w[proposed threshold_reached expired]).each { |status, code| status.update!(code: code) }
        end

        let(:idea_status) { create(:proposals_status) }

        example '[Error] Cannot reorder a proposals status into the automated status section', document: false do
          do_request
          assert_status 422
          expect(json_parse(response_body).dig(:errors, :base)).to eq 'Cannot reorder into the automatic statuses section'
        end
      end
    end
  end

  delete 'web_api/v1/idea_statuses/:id' do
    let(:idea_status) { create(:idea_status) }
    let(:id) { idea_status.id }

    context 'when visitor' do
      example '[Error] Cannot delete an idea status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when resident' do
      before { resident_header_token }

      let(:idea_status) { create(:proposals_status) }

      example '[Error] Cannot delete a proposal status', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example 'Delete a idea status by ID' do
        expect { do_request }.to have_enqueued_job(LogActivityJob).with(kind_of(String), 'deleted', kind_of(User), kind_of(Integer), payload: anything)
        assert_status 200
        expect(IdeaStatus.find_by(id: id)).to be_nil
      end

      describe do
        let(:idea_status) { create(:idea_status_proposed) }

        example_request '[Error] Cannot delete the proposed status' do
          assert_status 422
          expect(json_parse(response_body).dig(:errors, :base)).to eq 'Cannot delete the proposed status'
        end
      end
    end
  end
end
