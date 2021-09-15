require 'rails_helper'

describe CreatePageService do
  let(:service) { described_class.new(page, user) }
  let(:user) { create(:user) }
  let(:page) do
    Page.new(
      slug: 'example',
      publication_status: 'published',
      title_multiloc: page_title_multiloc,
      body_multiloc: page_body_multiloc,
      navbar_item_attributes: {
        title_multiloc: navbar_item_title_multiloc
      }
    )
  end
  let(:page_title_multiloc) do
    {
      "en" => Faker::Lorem.sentence,
      "nl-BE" => Faker::Lorem.sentence
    }
  end
  let(:page_body_multiloc) do
    {
      "en" => Faker::Lorem.sentence,
      "nl-BE" => Faker::Lorem.sentence
    }
  end
  let(:navbar_item_title_multiloc) do
    { "en" => "EN title", "nl-BE" => "BE title" }
  end

  # reserved pages should exist for each tenant
  let!(:home_page) { create(:page, :home) }
  let!(:projects_page) { create(:page, :projects) }

  it 'creates a page' do
    expect { service.call }
      .to change { Page.count }.from(2).to(3)
      .and change { NavbarItem.count }.from(2).to(3)
      .and have_enqueued_job(LogActivityJob)

    page = Page.find_by(slug: 'example')
    expect(page).to be_present
    expect(page).to have_attributes(
      publication_status: "published",
      title_multiloc: page_title_multiloc,
      body_multiloc: page_body_multiloc
    )

    expect(page.navbar_item).to have_attributes(
      type: "custom",
      title_multiloc: navbar_item_title_multiloc
    )

    expect(home_page.navbar_item).to have_attributes(visible: true, ordering: 0)
    expect(projects_page.navbar_item).to have_attributes(visible: true, ordering: 1)
    expect(page.navbar_item).to have_attributes(visible: false, ordering: 0)
  end

  context "when the navbar item's ordering has been already taken" do
    let!(:hidden_page_0) { create(:page, navbar_item: build(:navbar_item, visible: false, ordering: 0)) }
    let!(:hidden_page_1) { create(:page, navbar_item: build(:navbar_item, visible: false, ordering: 1)) }

    it "moves all the hidden items below" do
      service.call

      expect(page.navbar_item).to have_attributes(visible: false, ordering: 0)
      expect(hidden_page_0.navbar_item.reload).to have_attributes(visible: false, ordering: 1)
      expect(hidden_page_1.navbar_item.reload).to have_attributes(visible: false, ordering: 2)
    end
  end

  context "when the navbar item's title is too long" do
    let(:navbar_item_title_multiloc) do
      { "en" => "This title is more than 20 characters" }
    end

    it "returns an error" do
      service.call

      expect(page.errors.details.to_h).to include(
        :"navbar_item.title_multiloc" => [{:error=>"Cannot be more than 20 characters (lang: en, size: 37)"}]
      )
    end
  end
end
