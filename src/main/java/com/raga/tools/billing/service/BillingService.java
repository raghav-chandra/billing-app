package com.raga.tools.billing.service;

import com.raga.tools.billing.RequestType;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

/**
 * Created by ragha on 22-04-2018.
 */
public class BillingService {

    public static Handler<RoutingContext> createBillHandler() {
        return new CreateBuillHandler();
    }

    public static Handler<RoutingContext> getBillByIdHandler() {
        return new GetBillHandler();
    }

    private static class CreateBuillHandler extends AbstractRequestHandler<JsonObject, JsonObject> {
        public CreateBuillHandler() {
            super("bill", RequestType.CREATE_BILL);
        }

        @Override
        protected JsonObject getRequestData(HttpServerRequest request, Buffer body) {
            return body == null ? new JsonObject() : body.toJsonObject();
        }
    }

    private static class GetBillHandler extends AbstractRequestHandler<Integer, JsonObject> {

        public GetBillHandler() {
            super("billId", RequestType.GET_BILL_BY_ID);
        }

        @Override
        protected Integer getRequestData(HttpServerRequest request, Buffer body) {
            return Integer.valueOf(request.getParam("billId"));
        }
    }
}
