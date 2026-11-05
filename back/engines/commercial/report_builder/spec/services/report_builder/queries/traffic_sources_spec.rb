# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportBuilder::Queries::TrafficSources do
  subject(:query) { described_class.new(build(:user)) }

  describe '#run_query' do
    before_all do
      # Make TimeBoundariesParser work as expected
      AppConfiguration.instance.update!(
        created_at: Date.new(2021, 1, 1),
        platform_start_at: Date.new(2021, 1, 1)
      )
    end

    it 'identifies direct traffic (referrer is empty string or nil)' do
      create(:session, :with_pageview, referrer: '')
      create(:session, :with_pageview, referrer: nil)
      create(:session, :with_pageview, referrer: nil)

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'direct_entry' => 3
      })
    end

    it 'identifies search engines' do
      create(:session, :with_pageview, referrer: 'https://www.google.com/')
      create(:session, :with_pageview, referrer: 'https://www.bing.com/')
      create(:session, :with_pageview, referrer: 'https://bing.com/')
      create(:session, :with_pageview, referrer: 'https://www.google.nl/')
      create(:session, :with_pageview, referrer: 'https://www.google.co.uk/')
      create(:session, :with_pageview, referrer: 'android-app://com.google.android.googlequicksearchbox/')
      create(:session, :with_pageview, referrer: 'https://duckduckgo.com/')
      create(:session, :with_pageview, referrer: 'https://www.ecosia.org/')
      create(:session, :with_pageview, referrer: 'https://search.yahoo.com/')
      create(:session, :with_pageview, referrer: 'https://cl.search.yahoo.com/')
      create(:session, :with_pageview, referrer: 'https://yandex.ru/')
      create(:session, :with_pageview, referrer: 'https://www.msn.com/')
      create(:session, :with_pageview, referrer: 'https://www.qwant.com/')
      create(:session, :with_pageview, referrer: 'https://www.startpage.com/')
      create(:session, :with_pageview, referrer: 'https://search.brave.com/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'search_engine' => 15
      })
    end

    it 'identifies social networks' do
      create(:session, :with_pageview, referrer: 'https://www.facebook.com/')
      create(:session, :with_pageview, referrer: 'https://m.facebook.com/')
      create(:session, :with_pageview, referrer: 'https://lm.facebook.com/')
      create(:session, :with_pageview, referrer: 'https://l.facebook.com/')
      create(:session, :with_pageview, referrer: 'https://www.instagram.com/')
      create(:session, :with_pageview, referrer: 'https://l.instagram.com/')
      create(:session, :with_pageview, referrer: 'http://instagram.com/')
      create(:session, :with_pageview, referrer: 'https://www.linkedin.com/')
      create(:session, :with_pageview, referrer: 'https://www.snapchat.com/')
      create(:session, :with_pageview, referrer: 'android-app://com.linkedin.android/')
      create(:session, :with_pageview, referrer: 'https://www.reddit.com/')
      create(:session, :with_pageview, referrer: 'https://out.reddit.com/')
      create(:session, :with_pageview, referrer: 'https://www.hoplr.com/')
      create(:session, :with_pageview, referrer: 'https://www.tiktok.com/')
      create(:session, :with_pageview, referrer: 'https://www.twitter.com/')
      create(:session, :with_pageview, referrer: 'https://x.com')
      create(:session, :with_pageview, referrer: 'https://lnkd.in/')
      create(:session, :with_pageview, referrer: 'https://bsky.app/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'social_network' => 18
      })
    end

    it 'identifies SSO redirects' do
      create(:session, :with_pageview, referrer: 'https://accounts.claveunica.gob.cl/')
      create(:session, :with_pageview, referrer: 'https://accounts.google.com/')
      create(:session, :with_pageview, referrer: 'https://login.microsoftonline.com/')
      create(:session, :with_pageview, referrer: 'https://my.esr.nhs.uk/')
      create(:session, :with_pageview, referrer: 'https://nemlog-in.mitid.dk/')
      create(:session, :with_pageview, referrer: 'https://frederikssund.criipto.id/')
      create(:session, :with_pageview, referrer: 'https://pvp.wien.gv.at/')
      create(:session, :with_pageview, referrer: 'https://app.franceconnect.gouv.fr/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'sso_redirect' => 8
      })
    end

    it 'identifies other traffic' do
      create(:session, :with_pageview, referrer: 'https://www.example.com/')
      create(:session, :with_pageview, referrer: 'https://www.gov.uk/')

      expect(query.run_query[:sessions_per_referrer_type]).to eq({
        'other' => 2
      })
    end

    it 'includes top 50 referrers, sorted desc by visits' do
      create_list(:session, 3, :with_pageview, referrer: 'https://www.google.com/')
      create_list(:session, 5, :with_pageview, referrer: 'https://www.facebook.com/')
      create_list(:session, 2, :with_pageview, referrer: 'https://www.example.com/', monthly_user_hash: '123')
      create_list(:session, 2, :with_pageview, referrer: 'https://www.example.com/', monthly_user_hash: '456')

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
      create_list(:session, 3, :with_pageview, referrer: 'https://www.google.com/')
      create_list(:session, 5, :with_pageview, referrer: 'https://www.facebook.com/')
      create_list(:session, 2, :with_pageview, referrer: 'https://www.example.com/', monthly_user_hash: '123')
      create_list(:session, 2, :with_pageview, referrer: 'https://www.example.com/', monthly_user_hash: '456')

      # SSO referrers
      create_list(:session, 3, :with_pageview, referrer: 'https://accounts.claveunica.gob.cl/')

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
