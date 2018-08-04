package com.raga.tools.billing.vertical;

import com.raga.tools.billing.RequestType;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public class LoginVerticle extends AbstractDBVertical {
    private static final String CREATE_LOGIN_SQL = "insert into LoginDetails (Userld,Name, Password, UserP,CreatedBy) values (?,?,?,?,?)";
    private static final String GET_LOGIN_SQL = "select * from LoginDetails where UserP=?";

    @Override
    public void start() {
        EventBus eventBus = vertx.eventBus();
        eventBus.<JsonObject>consumer(RequestType.CREATE_LOGIN.name(), message -> {
            JsonObject login = message.body().getJsonObject("login");
            String userId = login.getString("userId");
            String user = login.getString("user");
            String password = login.getString("password");
            String name = login.getString("name");
            String createdBy = login.getString("createdBy");
            JsonArray param = new JsonArray().add(userId).add(name).add(password).add(user).add(createdBy);
            executeGet(GET_LOGIN_SQL, new JsonArray().add(user), message, (messagel, rows) -> {
                if (!rows.isEmpty()) {
                    messagel.fail(50, "UserId already exists");
                } else {
                    executeUpdate(CREATE_LOGIN_SQL, param, message, (messagel3, id) -> messagel3.reply(new JsonObject().put("user", user)));
                }
            });
        });
        eventBus.<JsonObject>consumer(RequestType.LOGIN_DETAIL.name(), message -> {
            JsonObject cust = message.body().getJsonObject("login");
            String user = cust.getString("user");
            executeGet(GET_LOGIN_SQL, new JsonArray().add(user == null ? "" : user), message, (message12, rows) -> {
                if (rows.isEmpty()) {
                    message.reply(new JsonObject());
                } else {
                    message.reply(rows.getJsonObject(0));
                }
            });
        });
    }
}
