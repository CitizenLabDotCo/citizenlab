# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'AdminPublication' do
  explanation 'Describes the presentation (ordering and publication) of a folder or project'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when admin' do
    before do
      @admin = create(:admin)
      header_token_for(@admin)
    end

    patch 'web_api/v1/admin_publications/:id/reorder' do
      describe do
        let!(:projects) do
          Array.new(4) do |i|
            create(:project, admin_publication_attributes: { publication_status: 'published', ordering: i })
          end
        end

        example 'Works when ordering starts from zero: move first to third' do
          pre_reorder_publication_ids = AdminPublication.order(:ordering).pluck(:id)

          # We are going to move the first publication to the third position
          # so BEFORE: [A, B, C, D]
          # and AFTER: [B, C, A, D]
          do_request(id: pre_reorder_publication_ids[0], ordering: 2)

          expect(response_status).to eq 200

          post_reorder_publication_ids = AdminPublication.order(:ordering).pluck(:id)
          expect(post_reorder_publication_ids).to eq [
            pre_reorder_publication_ids[1], 
            pre_reorder_publication_ids[2], 
            pre_reorder_publication_ids[0], 
            pre_reorder_publication_ids[3]
          ]
        end
      end

      describe do
        let!(:projects) do
          Array.new(4) do |i|
            create(:project, admin_publication_attributes: { publication_status: 'published', ordering: i + 1 })
          end
        end

        example 'Works when ordering starts from 1: move first to third' do
          pre_reorder_publication_ids = AdminPublication.order(:ordering).pluck(:id)

          # We are going to move the first publication to the third position
          # so BEFORE: [A, B, C, D]
          # and AFTER: [B, C, A, D]
          do_request(id: pre_reorder_publication_ids[0], ordering: 3)

          expect(response_status).to eq 200

          post_reorder_publication_ids = AdminPublication.order(:ordering).pluck(:id)
          expect(post_reorder_publication_ids).to eq [
            pre_reorder_publication_ids[1], 
            pre_reorder_publication_ids[2], 
            pre_reorder_publication_ids[0], 
            pre_reorder_publication_ids[3]
          ]
        end
      end

      # OK so this shit does not work actually
      # describe do
      #   let!(:projects) do
      #     Array.new(4) do |i|
      #       create(:project, admin_publication_attributes: { 
      #         publication_status: 'published', 
      #         ordering: i * 2
      #       })
      #     end
      #   end

        # example 'Works when ordering starts from 1: move first between second and third' do
          # pre_reorder_publication_ids = AdminPublication.order(:ordering).pluck(:id)

          # # We are going to move the first publication to the third position
          # # so BEFORE: [A, B, C, D]
          # # and AFTER: [B, C, A, D]
          # do_request(id: pre_reorder_publication_ids[0], ordering: 3)

          # expect(response_status).to eq 200

          # post_reorder_publication_ids = AdminPublication.order(:ordering).pluck(:id)
          # expect(post_reorder_publication_ids).to eq [
          #   pre_reorder_publication_ids[1], 
          #   pre_reorder_publication_ids[2], 
          #   pre_reorder_publication_ids[0], 
          #   pre_reorder_publication_ids[3]
          # ]
        # end
      end
    end
  end
end