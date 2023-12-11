# frozen_string_literal: true

require 'rails_helper'

# These tests do not verify the response bodies. See the acceptance tests for that.
# The purpose of these tests is to describe that the side fx service hooks are triggered.

RSpec.describe ContentBuilder::WebApi::V1::ContentBuilderLayoutsController do
  routes { ContentBuilder::Engine.routes }
  let(:user) { create(:admin) }

  before do
    token = AuthToken::AuthToken.new(payload: user.to_token_payload).token
    request.headers['Authorization'] = "Bearer #{token}"
    request.headers['Content-Type'] = 'application/json'
  end

  describe 'upsert for create' do
    let(:project) { create(:project) }
    let(:project_id) { project.id }
    let(:code) { 'project_description' }

    context 'when saving is successful' do
      it 'triggers before_create and after_create hooks on the side fx service around saving the layout' do
        swapped = { 'swapped_data_images' => {} }
        not_swapped = { 'not_swapped_data_images' => {} }
        attributes = {
          content_buildable_type: 'Project',
          content_buildable_id: project_id,
          code: code,
          enabled: true,
          craftjs_json: not_swapped
        }
        layout = ContentBuilder::Layout.new(attributes)
        expect(ContentBuilder::Layout).to receive(:new).with(attributes).and_return layout
        service = controller.send(:side_fx_service)

        expect(service).to receive(:before_create).with(
          layout,
          user
        ).and_call_original
        expect(layout).to receive(:save).and_call_original
        expect(service).to receive(:after_create).with(
          layout,
          user
        ).and_call_original
        allow_any_instance_of(ContentBuilder::LayoutImageService).to receive(:swap_data_images).and_return(
          swapped
        )

        params = {
          content_buildable: 'Project',
          project_id: project_id,
          code: code,
          content_builder_layout: {
            enabled: true,
            craftjs_json: not_swapped
          }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:created)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
        expect(layout.reload.craftjs_json).to eq swapped
      end

      it 'sanitizes HTML inside text elements' do
        expected = { 'sanitized_craftjson' => {} }
        expect_any_instance_of(ContentBuilder::LayoutSanitizationService).to receive(:sanitize).and_return(
          expected
        )

        params = {
          content_buildable: 'Project',
          project_id: project_id,
          code: code,
          content_builder_layout: { craftjs_json: { 'unsanitized_craftjson' => {} } }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status :created
        expect(JSON.parse(response.body).dig('data', 'attributes', 'craftjs_json')).to eq(expected)
      end
    end

    context 'when saving is unsuccessful' do
      it 'triggers the before_create hook before saving, but not the after_create hook after saving' do
        attributes = {
          content_buildable_id: project.id,
          content_buildable_type: 'Project',
          code: code,
          enabled: true
        }
        layout = ContentBuilder::Layout.new(attributes)
        expect(ContentBuilder::Layout).to receive(:new).with(attributes).and_return layout
        service = controller.send(:side_fx_service)

        expect(service).to receive(:before_create).with(
          an_instance_of(ContentBuilder::Layout),
          user
        ).and_call_original
        expect(layout).to receive(:save).and_return false
        expect(service).not_to receive(:after_create)

        params = {
          content_buildable: 'Project',
          project_id: project_id,
          code: code,
          content_builder_layout: { enabled: true }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
      end
    end
  end

  describe 'upsert for update' do
    let(:layout) { create(:layout) }
    let(:project_id) { layout.content_buildable_id }
    let(:code) { layout.code }

    context 'when saving is successful' do
      it 'triggers the before_update and after_update hooks on the side fx service around saving the layout' do
        attributes = {
          content_buildable: layout.content_buildable,
          code: code
        }
        service = controller.send(:side_fx_service)

        expect(ContentBuilder::Layout).to receive(:find_by).with(attributes).and_return layout
        expect(service).to receive(:before_update).with(
          layout,
          user
        ).and_call_original
        expect(layout).to receive(:save).and_call_original
        expect(service).to receive(:after_update).with(
          layout,
          user
        ).and_call_original
        swapped = { 'swapped_data_images' => {} }
        allow_any_instance_of(ContentBuilder::LayoutImageService).to receive(:swap_data_images).and_return(
          swapped
        )

        params = {
          content_buildable: 'Project',
          project_id: project_id,
          code: code,
          content_builder_layout: {
            enabled: false,
            craftjs_json: { 'not_swapped_data_images' => {} }
          }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
        expect(layout.reload.craftjs_json).to eq swapped
      end

      it 'sanitizes HTML inside text elements' do
        expected = { 'sanitized_craftjson' => {} }
        layout # also calls sanitize (to make the expectation below work)
        expect_any_instance_of(ContentBuilder::LayoutSanitizationService).to receive(:sanitize).and_return(
          expected
        )

        params = {
          content_buildable: 'Project',
          project_id: project_id,
          code: code,
          content_builder_layout: { craftjs_jso: { 'unsanitized_craftjson' => {} } }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status :ok
        expect(JSON.parse(response.body).dig('data', 'attributes', 'craftjs_json')).to eq(expected)
      end
    end

    context 'when saving is unsuccessful' do
      it 'triggers the before_update hook before saving, but not the after_update hook after saving' do
        attributes = {
          content_buildable: layout.content_buildable,
          code: code
        }
        service = controller.send(:side_fx_service)

        expect(ContentBuilder::Layout).to receive(:find_by).with(attributes).and_return layout
        expect(service).to receive(:before_update).with(
          layout,
          user
        ).and_call_original
        expect(layout).to receive(:save).and_return false
        expect(service).not_to receive(:after_update)

        params = {
          content_buildable: 'Project',
          project_id: project_id,
          code: code,
          content_builder_layout: { enabled: false }
        }
        post :upsert, params: params, format: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to eq 'application/json; charset=utf-8'
      end
    end
  end

  describe 'destroy' do
    let(:layout) { create(:layout) }
    let(:project) { layout.content_buildable }
    let(:code) { layout.code }

    context 'when destroying is successful' do
      it 'triggers before_destroy and after_destroy hooks on the side fx service around destroying the layout' do
        attributes = {
          content_buildable: project,
          code: code
        }
        service = controller.send(:side_fx_service)
        expect(ContentBuilder::Layout).to receive(:find_by!).with(attributes).and_return layout

        expect(service).to receive(:before_destroy).with(
          layout,
          user
        ).and_call_original
        expect(layout).to receive(:destroy).and_call_original
        expect(service).to receive(:after_destroy).with(
          layout,
          user
        ).and_call_original

        params = {
          content_buildable: 'Project',
          project_id: project.id,
          code: code
        }
        delete :destroy, params: params, format: :json
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to eq 'application/json'
      end
    end

    context 'when destroying is unsuccessful' do
      it 'triggers the before_destroy hook before destroying, but not the after_destroy hook after destroying' do
        attributes = {
          content_buildable: project,
          code: code
        }
        service = controller.send(:side_fx_service)
        expect(ContentBuilder::Layout).to receive(:find_by!).with(attributes).and_return layout

        expect(service).to receive(:before_destroy).with(
          layout,
          user
        ).and_call_original
        expect(layout).to receive(:destroy).and_return layout
        expect(layout).to receive(:destroyed?).and_return false
        expect(service).not_to receive(:after_destroy)

        params = {
          content_buildable: 'Project',
          project_id: project.id,
          code: code
        }
        delete :destroy, params: params, format: :json
        expect(response).to have_http_status(:internal_server_error)
        expect(response.content_type).to eq 'application/json'
      end
    end
  end
end
