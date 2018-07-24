package com.raga.tools.billing.service;

import com.raga.tools.billing.RequestType;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.eventbus.EventBus;
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
            super("cust", RequestType.CREATE_GET_CUSTOMERS);
        }

        @Override
        protected JsonObject getRequestData(HttpServerRequest request, Buffer body) {
            return body == null ? new JsonObject() : body.toJsonObject();
        }

        @Override
        protected void handleFuture(HttpServerRequest request, JsonObject requestData, Future<JsonObject> future, EventBus eventBus) {
            Future<Void> billFuture = Future.future();
            future.compose(customer -> createBillFuture(eventBus, customer, requestData)).compose(result -> {
                request.response().end(JsonUtil.createSuccessResponse(result).encode());
            }, billFuture.setHandler(handler -> {
                if (handler.failed()) {
                    request.response().end(JsonUtil.createFailedResponse("Failed while saving bill : " + handler.cause().getMessage()).encode());
                }
            }));
        }

        private Future<JsonObject> createBillFuture(EventBus eventBus, JsonObject cust, JsonObject requestData) {
            Future<JsonObject> future = Future.future();
            JsonObject data = new JsonObject()
                    .put("customerId", cust.getInteger("customerId"))
                    .put("user", requestData.getString("userId"))
                    .put("date", requestData.getString("date"))
                    .put("billItems", requestData.getString("billItems"))
                    .put("customer", cust);

            eventBus.<JsonObject>send(RequestType.CREATE_BILL.name(), data, reply -> {
                if (reply.succeeded()) {
                    future.complete(reply.result().body());
                } else {
                    future.fail(reply.cause());
                }
            });

            return future;
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
