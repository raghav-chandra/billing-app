package com.raga.tools.billing.service;

import com.raga.tools.billing.RequestType;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

/**
 * Created by ragha on 13-09-2018.
 */
public class ReportingService {
    public static Handler<RoutingContext> dailyReportHandler() {
        return new DailyReportHandler();
    }

    private static class DailyReportHandler extends AbstractRequestHandler<JsonObject, JsonArray> {
        DailyReportHandler() {
            super("daily", RequestType.REPORT_DAILY);
        }

        @Override
        protected JsonObject getRequestData(HttpServerRequest request, Buffer body) {
            return body == null || body.toString().isEmpty() ? new JsonObject() : body.toJsonObject();
        }
    }
}
