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
        return new CreateBillHandler();
    }

    public static Handler<RoutingContext> getBillByIdHandler() {
        return new GetBillHandler();
    }

    public static Handler<RoutingContext> getBillByCriteria() {
        return new GetBillByCriteriaHandler();
    }


    private static class CreateBillHandler extends AbstractRequestHandler<JsonObject, JsonObject> {
        CreateBillHandler() {
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
                    handler.cause().printStackTrace();
                    request.response().end(JsonUtil.createFailedResponse("Failed while saving bill : " + handler.cause().getMessage()).encode());
                }
            }));
        }

        private Future<JsonObject> createBillFuture(EventBus eventBus, JsonObject customer, JsonObject requestData) {
            Future<JsonObject> future = Future.future();
            JsonObject data = new JsonObject()
                    .put("customerId", customer.getInteger("customerId"))
                    .put("user", requestData.getString("userId"))
                    .put("date", requestData.getString("date"))
                    .put("type", requestData.getString("type"))
                    .put("billAmount", requestData.getFloat("billAmount"))
                    .put("billItems", requestData.getJsonArray("billItems"))
                    .put("customer", customer);

            eventBus.<JsonObject>send(RequestType.CREATE_BILL.name(), data, reply -> {
                if (reply.succeeded()) {
                    future.complete(reply.result().body());
                } else {
                    future.fail(reply.cause());
                }
            });

            return future;
        }


        @Override
        protected boolean validateRequest(RoutingContext context) {
            JsonObject bill = context.getBodyAsJson();
            String name = bill.getString("name");
            String mobile = bill.getString("mobile");
            String date = bill.getString("date");
            Float amount = bill.getFloat("billAmount");

            boolean custValid = name != null && !name.trim().isEmpty()
                    && mobile != null && !mobile.trim().isEmpty()
                    && date != null && !date.trim().isEmpty()
                    && amount != null && amount >= 0;

            for (Object obj : bill.getJsonArray("billItems")) {
                JsonObject item = (JsonObject) obj;
                Integer itemId = item.getInteger("itemId");
                Integer qty = item.getInteger("qty");
                Float price = item.getFloat("price");
                Float gst = item.getFloat("gst");
                Float discount = item.getFloat("discount");
                if (itemId == null || itemId <= 0 || qty == null || qty <= 0 || price == null || price < 0 || gst == null || discount == null) {
                    return false;
                }
            }

            return custValid && bill.getJsonArray("billItems").size() > 0;
        }

        @Override
        protected void sendValidationFailure(HttpServerRequest request) {
            onFailure(request, new RuntimeException("Bill Items/Customer Information is not correct"));
        }
    }

    private static class GetBillHandler extends AbstractRequestHandler<Integer, JsonObject> {

        GetBillHandler() {
            super("billId", RequestType.GET_BILL_BY_ID);
        }

        @Override
        protected Integer getRequestData(HttpServerRequest request, Buffer body) {
            return Integer.valueOf(request.getParam("billId"));
        }

        @Override
        protected boolean validateRequest(RoutingContext context) {
            String billString = context.request().getParam("billId");
            try {
                int billId = Integer.parseInt(billString);
                return billId > 0;
            } catch (Exception e) {
                return false;
            }
        }

        @Override
        protected void sendValidationFailure(HttpServerRequest request) {
            onFailure(request, new RuntimeException("Bill Id > 0"));
        }
    }

    private static class GetBillByCriteriaHandler extends AbstractRequestHandler<JsonObject, JsonObject> {
        GetBillByCriteriaHandler() {
            super("criteria", RequestType.GET_BILL_BY_CRITERIA);
        }

        @Override
        protected JsonObject getRequestData(HttpServerRequest request, Buffer body) {
            return body == null ? new JsonObject() : body.toJsonObject();
        }

        @Override
        protected boolean validateRequest(RoutingContext context) {
            JsonObject criteria = context.getBodyAsJson();
            return criteria.getInteger("billId") != null || criteria.getString("mobile") != null || criteria.getString("fromDate") != null || criteria.getString("toDate") != null;
        }

        @Override
        protected void sendValidationFailure(HttpServerRequest request) {
            onFailure(request, new RuntimeException("please fill at-least 1 criteria"));
        }
    }
}
