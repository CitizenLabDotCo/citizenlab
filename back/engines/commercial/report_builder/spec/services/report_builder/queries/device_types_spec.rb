# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::DeviceTypes do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))
    end

    it 'works' do
      2.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: 'desktop_or_other')
      end

      3.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: 'mobile')
      end

      params = {
        start_at: Date.new(2023, 1, 1),
        end_at: Date.new(2023, 3, 1)
      }

      expect(query.run_query(**params)).to eq({
        counts_per_device_type: {
          'desktop_or_other' => 2,
          'mobile' => 3
        }
      })
    end

    it 'filters out nil device types' do
      2.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: nil)
      end

      3.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: 'mobile')
      end

      params = {
        start_at: Date.new(2023, 1, 1),
        end_at: Date.new(2023, 3, 1)
      }

      expect(query.run_query(**params)).to eq({
        counts_per_device_type: {
          'mobile' => 3
        }
      })
    end

    it 'filters by project' do
      project = create(:project_with_active_ideation_phase)
      project_path = "/en/projects/#{project.slug}"
      project_id = project.id

      2.times do
        session1 = create(:session, created_at: Date.new(2023, 2, 1), device_type: 'desktop_or_other')
        create(:pageview, session_id: session1.id, path: '/en/')
      end

      3.times do
        session2 = create(:session, created_at: Date.new(2023, 2, 1), device_type: 'mobile')
        create(:pageview, session_id: session2.id, path: project_path, project_id: project_id)
      end

      params = {
        start_at: Date.new(2023, 1, 1),
        end_at: Date.new(2023, 3, 1),
        project_id: project_id
      }

      expect(query.run_query(**params)).to eq({
        counts_per_device_type: {
          'mobile' => 3
        }
      })
    end

    it 'applies exclude_roles filter' do
      2.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: 'desktop_or_other', highest_role: 'admin')
      end

      3.times do
        create(:session, created_at: Date.new(2023, 2, 1), device_type: 'mobile')
      end

      params = {
        start_at: Date.new(2023, 1, 1),
        end_at: Date.new(2023, 3, 1),
        exclude_roles: 'exclude_admins_and_moderators'
      }

      expect(query.run_query(**params)).to eq({
        counts_per_device_type: {
          'mobile' => 3
        }
      })
    end

    it 'works if everything is nil' do
      params = {
        start_at: Date.new(2023, 1, 1),
        end_at: Date.new(2023, 3, 1)
      }

      expect(query.run_query(**params)).to eq({
        counts_per_device_type: {}
      })
    end
  end
end
