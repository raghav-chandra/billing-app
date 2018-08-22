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
public abstract class AbstractRequestHandler<S, T> implements Handler<RoutingContext> {

    private static final String COOKIE_STRING = "Cookie";
    private final String key;
    private final RequestType requestType;

    AbstractRequestHandler(String key, RequestType requestType) {
        this.key = key;
        this.requestType = requestType;
    }

    @Override
    public void handle(RoutingContext context) {
        HttpServerRequest request = context.request();
        EventBus eventBus = context.vertx().eventBus();

        if (validateRequest(context)) {
            S requestData = getRequestData(request, context.getBody());
            String cookie = context.request().headers().get(COOKIE_STRING);
            JsonObject reqObject = createRequestObject(key, requestData, cookie);

            handleFuture(request, requestData, createFuture(requestType, eventBus, reqObject), eventBus);
        } else {
            sendValidationFailure(request);
        }
    }

    protected void sendValidationFailure(HttpServerRequest request) {
        onFailure(request, new RuntimeException("Request Validation Failure"));
    }

    protected boolean validateRequest(RoutingContext context) {
        return true;
    }

    protected void handleFuture(HttpServerRequest request, S requestData, Future<T> future, EventBus eventBus) {
        future.setHandler(handler -> {
            if (handler.succeeded()) {
                onSuccess(request, handler.result());
            } else {
                onFailure(request, handler.cause());
            }
        });
    }

    private void onSuccess(HttpServerRequest request, T result) {
        request.response().end(JsonUtil.createSuccessResponse(result).encodePrettily());
    }

    void onFailure(HttpServerRequest request, Throwable cause) {
        request.response().end(JsonUtil.createFailedResponse(cause.getMessage()).encodePrettily());
    }

    private Future<T> createFuture(RequestType requestType, EventBus eventBus, JsonObject reqObject) {
        Future<T> future = Future.future();
        eventBus.<T>send(requestType.name(), reqObject, reply -> {
            if (reply.succeeded()) {
                future.complete(reply.result().body());
            } else {
                future.fail(reply.cause());
            }
        });
        return future;
    }

    protected JsonObject createRequestObject(String key, S requestData, String cookie) {
        return new JsonObject().put(key, requestData).put(COOKIE_STRING, cookie);
    }

    protected abstract S getRequestData(HttpServerRequest request, Buffer body);
}
