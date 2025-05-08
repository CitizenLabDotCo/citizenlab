# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::VisitorsLanguages do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))
    end

    it 'returns the number of sessions per locale' do
      session1 = create(:session, created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/ideas', created_at: DateTime.new(2022, 10, 10, 11, 2, 0))

      session2 = create(:session, created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/', created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/ideas', created_at: DateTime.new(2022, 10, 11, 11, 2, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1)
      }

      expect(query.run_query(**params)).to eq({
        sessions_per_locale: {
          'en' => 1,
          'nl-BE' => 1
        }
      })
    end

    it 'excludes paths without locales' do
      # Session where both pageviews use the english locale
      session1 = create(:session, created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/ideas', created_at: DateTime.new(2022, 10, 10, 11, 2, 0))

      # Session where the pageviews do not have a locale
      session2 = create(:session, created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/', created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/ideas', created_at: DateTime.new(2022, 10, 11, 11, 2, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1)
      }

      expect(query.run_query(**params)).to eq({
        sessions_per_locale: {
          'en' => 1
        }
      })
    end

    it 'when the locale changes during the session, it is counted as two sessions' do
      # Session where both pageviews have the same locale
      session1 = create(:session, created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/ideas', created_at: DateTime.new(2022, 10, 10, 11, 2, 0))

      # Session where the locale changes during the session
      session2 = create(:session, created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/en/', created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/ideas', created_at: DateTime.new(2022, 10, 11, 11, 2, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1)
      }

      expect(query.run_query(**params)).to eq({
        sessions_per_locale: {
          'en' => 2,
          'nl-BE' => 1
        }
      })
    end

    it 'works correctly for locales starging with "en"' do
      session1 = create(:session, created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/ideas', created_at: DateTime.new(2022, 10, 10, 11, 2, 0))

      session2 = create(:session, created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/en-GB/', created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/en-GB/ideas', created_at: DateTime.new(2022, 10, 11, 11, 2, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1)
      }

      expect(query.run_query(**params)).to eq({
        sessions_per_locale: {
          'en' => 1,
          'en-GB' => 1
        }
      })
    end

    it 'filters by project_id' do
      project = create(:project)

      # Session where project is visited
      session1 = create(:session, created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/projects/p1', project_id: project.id, created_at: DateTime.new(2022, 10, 10, 11, 2, 0))

      # Session where project is not visited
      session2 = create(:session, created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/', created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/ideas', created_at: DateTime.new(2022, 10, 11, 11, 2, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1),
        project_id: project.id
      }

      expect(query.run_query(**params)).to eq({
        sessions_per_locale: {
          'en' => 1
        }
      })
    end

    it 'excludes roles' do
      # Session by regular visitor
      session1 = create(:session, created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/ideas', created_at: DateTime.new(2022, 10, 10, 11, 2, 0))

      # Session by admin
      session2 = create(:session, created_at: DateTime.new(2022, 10, 11, 11, 0, 0), highest_role: 'admin')
      create(:pageview, session_id: session2.id, path: '/nl-BE/', created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/ideas', created_at: DateTime.new(2022, 10, 11, 11, 2, 0))

      params = {
        start_at: Date.new(2022, 8, 1),
        end_at: Date.new(2022, 11, 1),
        exclude_roles: 'exclude_admins_and_moderators'
      }

      expect(query.run_query(**params)).to eq({
        sessions_per_locale: {
          'en' => 1
        }
      })
    end

    it 'works if everything is nil' do
      session1 = create(:session, created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/', created_at: DateTime.new(2022, 10, 10, 11, 0, 0))
      create(:pageview, session_id: session1.id, path: '/en/ideas', created_at: DateTime.new(2022, 10, 10, 11, 2, 0))

      session2 = create(:session, created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/', created_at: DateTime.new(2022, 10, 11, 11, 0, 0))
      create(:pageview, session_id: session2.id, path: '/nl-BE/ideas', created_at: DateTime.new(2022, 10, 11, 11, 2, 0))

      params = {
        start_at: Date.new(2023, 10, 1),
        end_at: Date.new(2023, 11, 1)
      }

      expect(query.run_query(**params)).to eq({
        sessions_per_locale: {}
      })
    end
  end
end
