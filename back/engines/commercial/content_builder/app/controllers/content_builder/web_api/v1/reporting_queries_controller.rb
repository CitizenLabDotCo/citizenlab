# frozen_string_literal: true

module ContentBuilder
  module WebApi
    module V1
      # Answers the reporting query behind one custom block, through the same SQL sandbox
      # the MCP reporting tool uses.
      #
      # A report is a picture of a moment, so an answer is stored against the layout the
      # first time it is asked, and every later read returns that stored answer. Only an
      # admin, or the renderer with its scoped token, can fill a snapshot; a reader is
      # served from one or not at all, which is what keeps arbitrary SQL off the
      # citizen-facing path.
      class ReportingQueriesController < ::ApplicationController
        skip_before_action :authenticate_user, only: %i[create]

        def create
          query = params.require(:query).to_s
          layout = find_layout
          # Reading a layout's stored answer is reading the layout; find_layout is
          # what decides whether this user may see it at all.
          authorize(layout, :show?) if layout

          snapshot = layout && QuerySnapshot.find_by(
            layout_id: layout.id, query_hash: QuerySnapshot.hash_for(normalized(query))
          )
          return render_result(snapshot.data, snapshot.executed_at, snapshot: true) if snapshot

          # The custom block renderer's browser has no session, only a token good
          # for this one layout's data. Everyone else has to be an admin.
          unless scoped_token_permits?(layout)
            authorize :reporting_query, policy_class: ReportingQueryPolicy
          end

          execute_and_store(query, layout)
        rescue McpServer::ReportingQueryRunner::Rejected => e
          render json: { errors: { query: [{ error: 'rejected', detail: e.message }] } },
            status: :unprocessable_entity
        rescue ActiveRecord::StatementInvalid => e
          render json: { errors: { query: [{ error: 'execution_failed', detail: e.message }] } },
            status: :unprocessable_entity
        end

        # Replaces every stored answer this layout holds: the moment the report's editor
        # decides which data it shows from now on.
        def refresh
          layout = Layout.find(params[:layout_id])
          authorize_editing(layout)

          refreshed = QuerySnapshot.transaction do
            layout.query_snapshots.map do |snapshot|
              result = McpServer::ReportingQueryRunner.run(snapshot.sql)
              snapshot.update!(data: result_data(result), executed_at: Time.current)
              snapshot
            end
          end

          render json: {
            data: {
              id: layout.id,
              type: 'query_snapshot_refresh',
              attributes: { refreshed: refreshed.size, executed_at: refreshed.first&.executed_at }
            }
          }
        rescue McpServer::ReportingQueryRunner::Rejected => e
          render json: { errors: { base: [{ error: 'rejected', detail: e.message }] } },
            status: :unprocessable_entity
        rescue ActiveRecord::StatementInvalid => e
          render json: { errors: { base: [{ error: 'execution_failed', detail: e.message }] } },
            status: :unprocessable_entity
        end

        private

        # LayoutPolicy only knows the content types UserRoleService#can_moderate? knows,
        # which does not include reports; a report says for itself who may read it and
        # who may edit it.
        def report_for(layout)
          layout.content_buildable if layout&.content_buildable_type == 'ReportBuilder::Report'
        end

        def authorize_editing(layout)
          report = report_for(layout)
          report ? authorize(report, :write?) : authorize(layout, :update?)
        end

        def scoped_token_permits?(layout)
          return false if layout.nil?

          ScopedReportingToken.permits?(params[:reporting_token], layout_id: layout.id)
        end

        # Scoped, so a layout the user may not see cannot be used to read its answers.
        def find_layout
          return nil if params[:layout_id].blank?

          # A token names exactly one layout and is verified against it, so it stands
          # in for the scope the browser holding it cannot satisfy.
          if ScopedReportingToken.permits?(params[:reporting_token], layout_id: params[:layout_id])
            skip_policy_scope
            return Layout.find_by(id: params[:layout_id])
          end

          layout = Layout.find_by(id: params[:layout_id])
          # The scope drops a report for everyone ReportPolicy::Scope refuses, which is
          # every reader of a published one. ReportPolicy#layout? is the rule the
          # report's own layout endpoint uses.
          report = report_for(layout)
          return policy(report).layout? ? layout : nil if report

          policy_scope(Layout).find_by(id: params[:layout_id])
        end

        def normalized(query)
          McpServer::ReportingQueryRunner.validate!(query)
        end

        def execute_and_store(query, layout)
          sql = normalized(query)
          data = result_data(McpServer::ReportingQueryRunner.run(sql))
          executed_at = Time.current

          if layout
            # Two blocks asking the same question can race; the unique index decides
            # and the loser keeps what the winner stored.
            snapshot = QuerySnapshot.create_or_find_by!(
              layout_id: layout.id, query_hash: QuerySnapshot.hash_for(sql)
            ) { |s| s.assign_attributes(sql: sql, data: data, executed_at: executed_at) }
            return render_result(snapshot.data, snapshot.executed_at, snapshot: true)
          end

          render_result(data, executed_at, snapshot: false)
        end

        def result_data(result)
          { 'columns' => result.columns, 'rows' => result.rows, 'truncated' => result.truncated }
        end

        def render_result(data, executed_at, snapshot:)
          render json: {
            data: {
              # A digest of the answer, so a resource id is stable for the same data.
              id: Digest::SHA256.hexdigest(data.to_json),
              type: 'reporting_query',
              attributes: {
                columns: data['columns'],
                rows: data['rows'],
                truncated: data['truncated'],
                executed_at: executed_at,
                snapshot: snapshot
              }
            }
          }
        end
      end
    end
  end
end
