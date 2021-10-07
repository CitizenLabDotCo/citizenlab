require "rails_helper"

describe Navbar::UpdateNavbarItemService do
  let(:service) { described_class.new(navbar_item, attributes) }

  def service_call
    service.call
    navbar_item.reload
  end

  def create_navbar_item(attributes)
    build(:navbar_item, **attributes).tap do |navbar_item|
      create(:page, :skip_validation, navbar_item: navbar_item)
    end
  end

  let!(:navbar_item) do
    create_navbar_item(
      type: item_type,
      title_multiloc: { "en" => "Title" },
      visible: item_visible,
      ordering: item_ordering
    )
  end

  let(:item_type) { "custom" }
  let(:item_visible) { true }
  let(:item_ordering) { 2 }

  context "when no attributes are provided" do
    let(:attributes) { {} }

    it "doesn't change anything" do
      service_call
      expect(navbar_item).to have_attributes(
        title_multiloc: { "en" => "Title" },
        visible: true,
        ordering: 2
      )
    end
  end

  context "when only title changes" do
    let(:attributes) { { title_multiloc: { "en" => "Changed title" } } }

    it do
      service_call
      expect(navbar_item.title_multiloc).to eq( { "en" => "Changed title"})
    end
  end


  context "when title is too long" do
    let(:attributes) { { title_multiloc: { "en" => "This title is more than 20 characters" } } }

    it 'returns an error' do
      service_call
      expect(navbar_item.errors.details.to_h).to include(
        :title_multiloc => [{:error=>"Cannot be more than 20 characters (lang: en, size: 37)"}]
      )
    end
  end

  context "when nested attributes for the page are provied" do
    let(:attributes) do
      {
        page: {
          slug: "new-slug",
          publication_status: "draft",
          title_multiloc: { "en" => "New title"},
          body_multiloc: { "en" => "New body" }
        }
      }
    end

    it "changes the corresponding page" do
      service_call

      expect(navbar_item.page).to have_attributes(
        slug: "new-slug",
        publication_status: "draft",
        title_multiloc: { "en" => "New title"},
        body_multiloc: { "en" => "New body" }
      )
    end
  end

  context "when the visible list" do
    let(:item_visible) { true }

    context "when only the ordering has chagned" do
      let(:attributes) { { ordering: ordering } }
      let(:ordering) { 4 }

      context "when the ordering is ahead of the current one" do
        let(:item_ordering) { 2 }
        let(:ordering) { 4 }

        let!(:navbar_item_1) { create_navbar_item(visible: true, ordering: 1) }
        let!(:navbar_item_3) { create_navbar_item(visible: true, ordering: 3) }
        let!(:navbar_item_4) { create_navbar_item(visible: true, ordering: 4) }
        let!(:navbar_item_5) { create_navbar_item(visible: true, ordering: 5) }

        it "reorders all the items between" do
          service_call

          navbar_item_1.reload
          navbar_item_3.reload
          navbar_item_4.reload
          navbar_item_5.reload

          expect(navbar_item_1.ordering).to eq(1)
          expect(navbar_item_3.ordering).to eq(2)
          expect(navbar_item_4.ordering).to eq(3)
          expect(navbar_item.ordering).to eq(4)
          expect(navbar_item_5.ordering).to eq(5)
        end
      end

      context "when the ordering is behind of the current one" do
        let(:ordering) { 2 }
        let(:item_ordering) { 4 }

        let!(:navbar_item_1) { create_navbar_item(visible: true, ordering: 1) }
        let!(:navbar_item_2) { create_navbar_item(visible: true, ordering: 2) }
        let!(:navbar_item_3) { create_navbar_item(visible: true, ordering: 3) }
        let!(:navbar_item_5) { create_navbar_item(visible: true, ordering: 5) }

        it "reorders all the items between" do
          service_call

          navbar_item_1.reload
          navbar_item_2.reload
          navbar_item_3.reload
          navbar_item_5.reload

          expect(navbar_item_1.ordering).to eq(1)
          expect(navbar_item.ordering).to eq(2)
          expect(navbar_item_2.ordering).to eq(3)
          expect(navbar_item_3.ordering).to eq(4)
          expect(navbar_item_5.ordering).to eq(5)
        end
      end

      context "when the ordering is negative" do
        let(:ordering) { -2 }

        it "returns errors" do
          service_call
          expect(navbar_item.errors.details.to_h).to include(
            :ordering=>[
              {:error=>:greater_than_or_equal_to, :value=>-2, :count=>0},
              {:error=>:greater_than, :value=>-2, :count=>1}
            ]
          )
        end
      end

      context "when the ordering is greater than the maxiumum ordering" do
        let(:ordering) { 7 }

        it "returns errors" do
          service_call
          expect(navbar_item.errors.details.to_h.fetch(:ordering)).to include(
            :error=>:less_than, :count=>7, :value=>7
          )
        end
      end

      context "when the item's type is reserved" do
        let(:item_type) { "home" }

        it "returns errors" do
          service_call
          expect(navbar_item.errors.details.to_h).to include(
            :type => [{:error=>"Cannot reorder a reserved item. It's not allowed for the type (home)"}]
          )
        end
      end

      context "when the item's ordering is reserved" do
        let(:item_ordering) { 1 }

        it "returns errors" do
          service_call
          expect(navbar_item.errors.details.to_h.fetch(:ordering)).to include(
            :error=>"Cannot reorder a reserved item. It's not allowed for the ordering (1)"
          )
        end
      end

      context "when the new ordering is reserved" do
        let(:ordering) { 1 }

        it "returns errors" do
          service_call
          expect(navbar_item.errors.details.to_h).to include(
            :ordering=>[{:error=>:greater_than, :value=>1, :count=>1}]
          )
        end
      end
    end

    context "when the item becomes hidden" do
      let(:attributes) { { visible: false } }

      context "when the item's type is reserved" do
        let(:item_type) { "home" }

        it "raises an error" do
          service_call
          expect(navbar_item.errors.details.to_h).to include(
            :visible=>[{:error=>"Cannot show/hide a reserved item with type 'home'"}]
          )
        end
      end

      context "when the hidden list is empty" do
        let(:item_ordering) { 2 }

        it "raises an error" do
          service_call
<<<<<<< HEAD

=======
>>>>>>> populate-navbar-items-CL2-6743
          expect(navbar_item.ordering).to eq(0)
        end
      end

      context "when the hidden list is not empty" do
        let!(:navbar_item_0) { create_navbar_item(visible: false, ordering: 0) }
        let!(:navbar_item_1) { create_navbar_item(visible: false, ordering: 1) }

        it "adds the item to the end of the list" do
          service_call

          navbar_item_0.reload
          navbar_item_1.reload

          expect(navbar_item).not_to be_visible

          expect(navbar_item_0.ordering).to eq(0)
          expect(navbar_item_1.ordering).to eq(1)
          expect(navbar_item.ordering).to eq(2)
        end

        context "when ordering is specified" do
          let(:attributes) { { visible: false, ordering: 1 } }

          it "puts the item on the specified ordering" do
            service_call

            navbar_item_0.reload
            navbar_item_1.reload

            expect(navbar_item).not_to be_visible

            expect(navbar_item_0.ordering).to eq(0)
            expect(navbar_item.ordering).to eq(1)
            expect(navbar_item_1.ordering).to eq(2)
          end
        end
      end
    end
  end

  context "when the hidden list" do
    let(:item_visible) { false }

    let!(:home_item) { create_navbar_item(type: 'home', visible: true, ordering: 0) }
    let!(:projects_item) { create_navbar_item(type: 'projects', visible: true, ordering: 1) }

    context "when the item becomes visible" do
      let(:attributes) { { visible: true } }

      context "when the visible list is already full" do
        before do
          stub_const "NavbarItem::MAX_VISIBLE_ITEMS", 2
        end

        it "returns an error" do
          service_call

          expect(navbar_item.errors.details.to_h).to include(
            :visible=>[{:error=>"Cannot make the item visible when the list of visible items is full (max: 2)"}]
          )
        end
      end

      context "when ordering is specified" do
        let(:attributes) { { visible: true, ordering: 2 } }
        let!(:custom_item_2) { create_navbar_item(type: 'custom', visible: true, ordering: 2) }

        it 'moves the item to the specified position' do
          service_call

          home_item.reload
          projects_item.reload
          custom_item_2.reload

          expect(home_item.ordering).to eq(0)
          expect(projects_item.ordering).to eq(1)
          expect(navbar_item.ordering).to eq(2)
          expect(custom_item_2.ordering).to eq(3)
        end
      end


      context "when the ordering is reserved" do
        let(:attributes) { { visible: true, ordering: 1 } }

        it "returns errors" do
          service_call
          expect(navbar_item.errors.details.to_h).to include(
            ordering: [{:count=>1, :error=>:greater_than, :value=>1}]
          )
        end
      end
    end
  end
end
