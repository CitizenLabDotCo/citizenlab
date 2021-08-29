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
      position: item_position
    )
  end

  let(:item_type) { "custom" }
  let(:item_visible) { true }
  let(:item_position) { 2 }

  context "when no attributes is provided" do
    let(:attributes) { {} }

    it "doesn't change anything" do
      service_call
      expect(navbar_item).to have_attributes(
        title_multiloc: { "en" => "Title" },
        visible: true,
        position: 2
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

  context "when only the position has chagned" do
    let(:attributes) { { position: position } }

    context "when the position is ahead of the current one" do
      let(:position) { 4 }
      let(:item_position) { 2 }

      let!(:navbar_item_1) { create_navbar_item(position: 1) }
      let!(:navbar_item_3) { create_navbar_item(position: 3) }
      let!(:navbar_item_4) { create_navbar_item(position: 4) }
      let!(:navbar_item_5) { create_navbar_item(position: 5) }

      it "repositions all the items between" do
        service_call

        navbar_item_1.reload
        navbar_item_3.reload
        navbar_item_4.reload
        navbar_item_5.reload

        expect(navbar_item_1.position).to eq(1)
        expect(navbar_item_3.position).to eq(2)
        expect(navbar_item_4.position).to eq(3)
        expect(navbar_item.position).to eq(4)
        expect(navbar_item_5.position).to eq(5)
      end
    end

    context "when the position is behind of the current one" do
      let(:position) { 2 }
      let(:item_position) { 4 }

      let!(:navbar_item_1) { create_navbar_item(position: 1) }
      let!(:navbar_item_2) { create_navbar_item(position: 2) }
      let!(:navbar_item_3) { create_navbar_item(position: 3) }
      let!(:navbar_item_5) { create_navbar_item(position: 5) }

      it "repositions all the items between" do
        service_call

        navbar_item_1.reload
        navbar_item_2.reload
        navbar_item_3.reload
        navbar_item_5.reload

        expect(navbar_item_1.position).to eq(1)
        expect(navbar_item.position).to eq(2)
        expect(navbar_item_2.position).to eq(3)
        expect(navbar_item_3.position).to eq(4)
        expect(navbar_item_5.position).to eq(5)
      end
    end

    context "when the position is negative" do
      let(:position) { -2 }

      it "raises an error" do
        expect { service_call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the position is greater than the maxiumum position" do
      let(:position) { 7 }

      it "raises an error" do
        expect { service_call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the item is home" do
      let(:item_type) { "home" }
      let(:position) { 4 }

      it "raises an error" do
        expect { service_call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the item is projects" do
      let(:item_type) { "projects" }
      let(:position) { 4 }

      it "raises an error" do
        expect { service_call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the position is 0" do
      let(:position) { 0 }

      context "when the item is visible" do
        let(:item_visible) { true }

        it "raises an error" do
          expect { service_call }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end

      context "when the item is hidden" do
        let(:item_visible) { false }

        it "changes the position" do
          expect { service.call }.to change { navbar_item.position }.from(2).to(0)
        end
      end
    end

    context "when the position is 1" do
      let(:position) { 1 }

      context "when the item is visible" do
        let(:item_visible) { true }

        it "raises an error" do
          expect { service_call }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end

      context "when the item is hidden" do
        let(:item_visible) { false }

        it "changes the position" do
          expect { service.call }.to change { navbar_item.position }.from(2).to(1)
        end
      end
    end
  end

  context "when the item becomes hidden" do
    let(:attributes) { { visible: false } }
    let(:item_visible) { true }

    context "when the item is home" do
      let(:item_type) { "home" }

      it "raises an error" do
        expect { service.call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the item is projects" do
      let(:item_type) { "projects" }

      it "raises an error" do
        expect { service.call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the hidden list is empty" do
      let(:item_position) { 2 }

      it "raises an error" do
        service_call

        expect(navbar_item.position).to eq(0)
      end
    end

    context "when the hidden list is not empty" do
      let!(:navbar_item_0) { create_navbar_item(visible: false, position: 0) }
      let!(:navbar_item_1) { create_navbar_item(visible: false, position: 1) }

      it "adds the item to the end of the list" do
        service_call

        navbar_item_0.reload
        navbar_item_1.reload

        expect(navbar_item).not_to be_visible

        expect(navbar_item_0.position).to eq(0)
        expect(navbar_item_1.position).to eq(1)
        expect(navbar_item.position).to eq(2)
      end

      context "when position is specified" do
        let(:attributes) { { visible: false, position: 1 } }

        it "puts the item on the specified position" do
          service_call

          navbar_item_0.reload
          navbar_item_1.reload

          expect(navbar_item).not_to be_visible

          expect(navbar_item_0.position).to eq(0)
          expect(navbar_item.position).to eq(1)
          expect(navbar_item_1.position).to eq(2)
        end
      end
    end
  end

  context "when the item becomes visible" do
    let(:attributes) { { visible: true } }
    let(:item_visible) { false }
    let(:item_position) { 0 }

    context "when the position is reserved" do
      let(:position) { 1 }

      it "raises an error" do
        expect { service_call }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when the visible list is already full" do
      let(:attributes) { { visible: true, position: 2 } }

      let!(:navbar_item_0) { create_navbar_item(type: 'home', visible: true, position: 0) }
      let!(:navbar_item_1) { create_navbar_item(type: 'projects', visible: true, position: 1) }
      let!(:navbar_item_2) { create_navbar_item(type: 'custom', visible: true, position: 2) }
      let!(:navbar_item_3) { create_navbar_item(type: 'custom', visible: true, position: 3) }

      let!(:hidden_navbar_item) { create_navbar_item(type: 'custom', visible: false, position: 1) }

      before do
        stub_const "NavbarItem::MAX_VISIBLE_ITEMS", 4
      end

      it do
        service_call

        navbar_item_0.reload
        navbar_item_1.reload
        navbar_item_2.reload
        navbar_item_3.reload

        expect(navbar_item_0).to have_attributes(visible: true, position: 0)
        expect(navbar_item_1).to have_attributes(visible: true, position: 1)
        expect(navbar_item).to have_attributes(visible: true, position: 2)
        expect(navbar_item_2).to have_attributes(visible: true, position: 3)

        expect(hidden_navbar_item).to have_attributes(visible: false, position: 0)
        expect(navbar_item_3).to have_attributes(visible: false, position: 1)
      end
    end
  end
end
