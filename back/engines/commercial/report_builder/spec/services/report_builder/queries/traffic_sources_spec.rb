# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::TrafficSources do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(created_at: Date.new(2021, 1, 1))
    end

    it 'identifies direct traffic (referrer is empty string or nil)' do
      create(:session, referrer: '')
      create(:session, referrer: nil)
      create(:session, referrer: nil)

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'direct_entry' => 3
      })
    end

    it 'identifies search engines' do
      create(:session, referrer: 'https://www.google.com/')
      create(:session, referrer: 'https://www.bing.com/')
      create(:session, referrer: 'https://bing.com/')
      create(:session, referrer: 'https://www.google.nl/')
      create(:session, referrer: 'https://www.google.co.uk/')
      create(:session, referrer: 'android-app://com.google.android.googlequicksearchbox/')
      create(:session, referrer: 'https://duckduckgo.com/')
      create(:session, referrer: 'https://www.ecosia.org/')
      create(:session, referrer: 'https://search.yahoo.com/')
      create(:session, referrer: 'https://cl.search.yahoo.com/')
      create(:session, referrer: 'https://yandex.ru/')
      create(:session, referrer: 'https://www.msn.com/')
      create(:session, referrer: 'https://www.qwant.com/')
      create(:session, referrer: 'https://www.startpage.com/')
      create(:session, referrer: 'https://search.brave.com/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'search_engine' => 15
      })
    end

    it 'identifies social networks' do
      create(:session, referrer: 'https://www.facebook.com/')
      create(:session, referrer: 'https://m.facebook.com/')
      create(:session, referrer: 'https://lm.facebook.com/')
      create(:session, referrer: 'https://l.facebook.com/')
      create(:session, referrer: 'https://www.instagram.com/')
      create(:session, referrer: 'https://l.instagram.com/')
      create(:session, referrer: 'http://instagram.com/')
      create(:session, referrer: 'https://www.linkedin.com/')
      create(:session, referrer: 'https://www.snapchat.com/')
      create(:session, referrer: 'android-app://com.linkedin.android/')
      create(:session, referrer: 'https://www.reddit.com/')
      create(:session, referrer: 'https://out.reddit.com/')
      create(:session, referrer: 'https://www.hoplr.com/')
      create(:session, referrer: 'https://www.tiktok.com/')
      create(:session, referrer: 'https://www.twitter.com/')
      create(:session, referrer: 'https://x.com')
      create(:session, referrer: 'https://lnkd.in/')
      create(:session, referrer: 'https://bsky.app/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'social_network' => 18
      })
    end

    it 'filtesr out SSO redirects' do
      create(:session, referrer: 'https://accounts.claveunica.gob.cl/')
      create(:session, referrer: 'https://accounts.google.com/')
      create(:session, referrer: 'https://login.microsoftonline.com/')
      create(:session, referrer: 'https://my.esr.nhs.uk/')
      create(:session, referrer: 'https://nemlog-in.mitid.dk/')
      create(:session, referrer: 'https://frederikssund.criipto.id/')
      create(:session, referrer: 'https://pvp.wien.gv.at/')
      create(:session, referrer: 'https://app.franceconnect.gouv.fr/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({})
    end

    it 'identifies other traffic' do
      create(:session, referrer: 'https://www.example.com/')
      create(:session, referrer: 'https://www.gov.uk/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'other' => 2
      })
    end

    it 'includes top 50 referrers, sorted desc by visits' do
      create_list(:session, 3, referrer: 'https://www.google.com/')
      create_list(:session, 5, referrer: 'https://www.facebook.com/')
      create_list(:session, 2, referrer: 'https://www.example.com/', monthly_user_hash: '123')
      create_list(:session, 2, referrer: 'https://www.example.com/', monthly_user_hash: '456')

      expect(query.run_query[:top_50_referrers]).to eq([
        {
          referrer: 'https://www.facebook.com/',
          visits: 5,
          visitors: 1,
          referrer_type: 'social_network'
        },
        {
          referrer: 'https://www.example.com/',
          visits: 4,
          visitors: 2,
          referrer_type: 'other'
        },
        {
          referrer: 'https://www.google.com/',
          visits: 3,
          visitors: 1,
          referrer_type: 'search_engine'
        }
      ])
    end

    it 'does not include sso redirects in top 50 referrers' do
      create_list(:session, 3, referrer: 'https://www.google.com/')
      create_list(:session, 5, referrer: 'https://www.facebook.com/')
      create_list(:session, 2, referrer: 'https://www.example.com/', monthly_user_hash: '123')
      create_list(:session, 2, referrer: 'https://www.example.com/', monthly_user_hash: '456')

      # SSO referrers
      create_list(:session, 3, referrer: 'https://accounts.claveunica.gob.cl/')

      expect(query.run_query[:top_50_referrers]).to eq([
        {
          referrer: 'https://www.facebook.com/',
          visits: 5,
          visitors: 1,
          referrer_type: 'social_network'
        },
        {
          referrer: 'https://www.example.com/',
          visits: 4,
          visitors: 2,
          referrer_type: 'other'
        },
        {
          referrer: 'https://www.google.com/',
          visits: 3,
          visitors: 1,
          referrer_type: 'search_engine'
        }
      ])
    end
  end
end
