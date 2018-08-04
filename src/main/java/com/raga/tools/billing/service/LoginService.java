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
public class LoginService {

    public static Handler<RoutingContext> createUserHandler() {
        return new UserHandler(RequestType.CREATE_LOGIN);
    }

    public static Handler<RoutingContext> getUserHandler() {
        return new UserHandler(RequestType.LOGIN_DETAIL);
    }

    static class UserHandler extends AbstractRequestHandler<JsonObject,String> {

        UserHandler(RequestType requestType) {
            super("login", requestType);
        }

        @Override
        protected JsonObject getRequestData(HttpServerRequest request, Buffer body) {
            return body ==null ? new JsonObject():body.toJsonObject();
        }
    }
}
