# frozen_string_literal: true

require 'rails_helper'

describe AdminApi::ProjectCopyService do
  let(:service) { AdminApi::ProjectCopyService.new }

  describe 'project copy', slow_test: true do
    it 'works' do
      load Rails.root.join('db/seeds.rb')
      Apartment::Tenant.switch('localhost') do
        load Rails.root.join('db/seeds.rb')
      end
      create(:idea_status, code: 'proposed')
      expected_count = 0
      slugs = [nil, 'Your coolest tricks to cool down the city']
      [false, true].each do |include_ideas|
        slugs.each do |new_slug|
          template = Apartment::Tenant.switch('localhost') do
            project = Project.all.sample
            service.export project, include_ideas: include_ideas, new_slug: new_slug
          end

          service.import template
          expected_count += 1
          expect(Project.count).to eq expected_count
        end
      end
    end
  end
end
