package com.raga.tools.billing.vertical;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.sql.SQLOptions;

import java.util.List;

/**
 * Created by ragha on 22-04-2018.
 */
public class AbstractDBVertical extends AbstractVerticle {

    private JDBCClient jdbcClient;

    public JDBCClient getJdbcClient() {
        if (jdbcClient == null) {
            String url = config().getString("db.url");
            String user = config().getString("db.user");
            String pass = config().getString("db.password");
            String driver = config().getString("db.driver");

            jdbcClient = JDBCClient.createShared(vertx, new JsonObject()
                    .put("url", url)
                    .put("user", user)
                    .put("password", pass)
                    .put("driver_class", driver)
                    .put("max_pool_size", 5));
        }
        return jdbcClient;
    }

    void executeUpdate(String sql, JsonArray params, Message message, ResultHandler<Integer> resultHandler) {
        getJdbcClient().getConnection(handler -> {
            if (handler.failed()) {
                message.fail(500, "Couldn't get DB Connections");
            } else {
                try (SQLConnection connection = handler.result()) {
                    connection.setOptions(new SQLOptions().setAutoGeneratedKeys(true));

                    connection.updateWithParams(sql, params, bill -> {
                        if (bill.failed()) {
                            message.fail(500, "Failed while creating item. Please retry");
                        } else {
                            resultHandler.handle(message, bill.result().getKeys().getInteger(0));
                        }
                    });
                } catch (Exception e) {
                    message.fail(500, e.getMessage());
                }
            }
        });
    }

    void executeBatchUpdate(String sql, List<JsonArray> params, Message message, ResultHandler<List<Integer>> resultHandler) {

        getJdbcClient().getConnection(handler -> {
            if (handler.failed()) {
                message.fail(500, "Failed while connecting to DB: " + handler.cause().getMessage());
            } else {
                try (SQLConnection connection = handler.result()) {
                    connection.batchWithParams(sql, params, item -> {
                        if(item.failed()) {
                            message.fail(500, "Failed while creati\ng BIll Item : " + item.cause().getMessage());
                        } else {
                            resultHandler.handle(message, item.result());
                        }
                    });
                } catch (Exception e) {
                    message.fail(500, e.getMessage());
                }
            }
        });
    }
    void executeBatchUpdate(String sql, List<JsonArray> params, Message message) {
        executeBatchUpdate(sql, params, message, (message1, result) -> message1.reply(result));
    }

    void executeGet(String sql, JsonArray params, Message message, ResultHandler<JsonArray> resultHandler) {
        getJdbcClient().getConnection(handler -> {
            if (handler.failed()) {
                message.fail(500, "Failed while connecting to DB: " + handler.cause().getMessage());
            } else {
                try (SQLConnection connection = handler.result()) {
                    connection.queryWithParams(sql, params, res -> {
                        if (res.failed()) {
                            message.fail(500, res.cause().getMessage());
                        } else {
                            resultHandler.handle(message, res.result().toJson().getJsonArray("rows"));
                        }
                    });
                } catch (Exception e) {
                    message.fail(500, e.getMessage());
                }
            }
        });
    }

    void executeGet(String sql, JsonArray params, Message message) {
        executeGet(sql, params, message, Message::reply);
    }

    interface ResultHandler<T> {
        void handle(Message message, T result);
    }
}

