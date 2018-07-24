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
public class AdminService {
    public static Handler<RoutingContext> addMenuItemHandler() {
        return new CreateMenuItem();
    }

    public static Handler<RoutingContext> getAllItemsHandler() {
        return new GetRequestHandler(RequestType.GET_ALL_ITEMS);
    }

    public static Handler<RoutingContext> getAllConfigsHandler() {
        return new GetRequestHandler(RequestType.GET_ALL_CONFIGS);
    }

    private static class CreateMenuItem extends AbstractRequestHandler<JsonObject, JsonObject> {
        public CreateMenuItem() {
            super("menuItem", RequestType.CREATE_MENU_ITEM);
        }

        @Override
        protected JsonObject getRequestData(HttpServerRequest request, Buffer body) {
            return body == null ? new JsonObject() : body.toJsonObject();
        }
    }

    private static class GetRequestHandler extends AbstractRequestHandler<JsonObject, JsonObject> {


        public GetRequestHandler(RequestType requestType) {
            super("", requestType);
        }

        @Override
        protected JsonObject getRequestData(HttpServerRequest request, Buffer body) {
            return null;
        }
    }
}
