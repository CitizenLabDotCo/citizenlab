# frozen_string_literal: true

module ReportBuilder
  module WebApi
    module V1
      class ReportsController < ::ApplicationController
        skip_before_action :authenticate_user

        def index
          default_scope = ReportBuilder::Report.global # No phase_id means global reports
          finder_params = {}.tap do |f_params|
            # Avoid to create params with nil values if they are not present
            f_params[:text_search] = params[:search] if params.key?(:search)
            f_params[:owners] = params[:owner_id] if params.key?(:owner_id)

            if params.key?(:service)
              f_params[:service_reports] = case params[:service]&.downcase
              when 'true' then true
              when 'false' then false
              end
            end

            if params.key?(:community_monitor)
              default_scope = ReportBuilder::Report.all # We need to include reports with a phase id to find community_monitor
              f_params[:community_monitor] = true # Just the presence of the param is enough - false does not mean anything
            end
          end

          reports = policy_scope(default_scope)
            .then { ReportBuilder::ReportFinder.new(_1, **finder_params).execute }
            .then { paginate(_1) }

          render json: linked_json(
            reports,
            ReportSerializer,
            params: jsonapi_serializer_params
          )
        end

        def show
          render json: serialize_report(report)
        end

        def create
          report = authorize(ReportBuilder::Report.new(create_params))
          side_fx_service.before_create(report, current_user)
          return send_unprocessable_entity(report) unless report.save

          side_fx_service.after_create(report, current_user)
          render json: serialize_report(report), status: :created
        end

        def copy
          # We wrap the whole report creation in a transaction to ensure that the layout
          # duplication (that is persisted directly — see {ContentBuilder::Layout#duplicate!}
          # is rolled back if the report copy fails.
          report_copy = ActiveRecord::Base.transaction do
            copy = report.dup.tap do |copy_|
              copy_.name = generate_copy_name(report.name)
              copy_.owner_id = current_user.id
              # Copies are never associated with a phase, even if the source report was.
              # That's because, currently, there can be only one report per phase.
              copy_.phase_id = nil
              copy_.visible = false
              copy_.layout = report.layout.duplicate!
            end

            authorize(copy)
            side_fx_service.before_create(copy, current_user)

            copy.save!
            # Update self-references in the layout to point to the new report. The report
            # copy must be saved before this operation, because it needs an ID.
            copy.layout.update!(craftjs_json: JSON.parse(
              copy.layout.craftjs_json.to_json.gsub(report.id.to_s, copy.id.to_s)
            ))

            side_fx_service.after_create(copy, current_user)

            copy
          end

          render json: serialize_report(report_copy), status: :created
        rescue ActiveRecord::RecordInvalid => e
          record = e.record
          record.is_a?(ReportBuilder::Report) ? send_unprocessable_entity(record) : raise
        end

        def update
          report.attributes = update_params
          side_fx_service.before_update(report, current_user)

          unless ReportSaver.new(report, current_user).save
            return send_unprocessable_entity(report)
          end

          side_fx_service.after_update(report, current_user)
          render json: serialize_report(report), status: :ok
        end

        def destroy
          side_fx_service.before_destroy(report, current_user)
          if report.destroy
            side_fx_service.after_destroy(report, current_user)
            head :no_content
          else
            head :internal_server_error
          end
        end

        def layout
          render json: ContentBuilder::WebApi::V1::LayoutSerializer.new(
            report.layout,
            params: jsonapi_serializer_params
          ).serializable_hash
        end

        private

        def report
          @report ||= authorize(
            ReportBuilder::Report.includes(:layout).find(params[:id])
          )
        end

        def create_params
          {
            'owner' => current_user,
            'layout_attributes' => {
              'craftjs_json' => {},
              'enabled' => true,
              'code' => 'report'
            }
          }.deep_merge(params.require(:report).permit(:phase_id))
            .deep_merge(shared_params.to_h)
        end

        def update_params
          @update_params ||= shared_params.tap do |parameters|
            if parameters.key?(:layout_attributes)
              parameters[:layout_attributes][:id] = report.layout.id
            end
          end
        end

        def shared_params
          parameters = params
            .require(:report)
            .permit(
              :name,
              :phase_id,
              :visible,
              :year,
              :quarter,
              layout: [craftjs_json: {}]
            )

          parameters[:layout_attributes] = parameters.delete(:layout) if parameters.key?(:layout)
          parameters
        end

        def serialize_report(report)
          options = { params: jsonapi_serializer_params, include: %i[layout phase] }
          ReportSerializer.new(report, options).serializable_hash.to_json
        end

        def side_fx_service
          @side_fx_service ||= ::ReportBuilder::SideFxReportService.new
        end

        def generate_copy_name(basename)
          candidate_generator = Enumerator.new do |enum|
            (1..).each { |i| enum.yield "#{basename} (#{i})" }
          end

          candidate_generator.each_slice(25).each do |candidates|
            taken_names = ReportBuilder::Report.where(name: candidates).pluck(:name)
            available_names = candidates - taken_names
            return available_names.first if available_names.present?
          end
        end
      end
    end
  end
end
