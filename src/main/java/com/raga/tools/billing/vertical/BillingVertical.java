package com.raga.tools.billing.vertical;

import com.raga.tools.billing.RequestType;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.sql.SQLOptions;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by ragha on 22-04-2018.
 */
public class BillingVertical extends AbstractDBVertical {

    private static final String CREATE_BILL_SQL = "insert into Bills (CustomerId,UpdatedBy,BillDate) value (?,?,?)";
    private static final String CREATE_BILL_ITEM_SQL = "insert into BillItems (BillId,ItemId,Quantity,Price,GSTPerc,DiscountPerc,UpdatedBy) value (?,?,?,?,?,?,?)";
    private static final String GET_BILL_BY_ID_SQL = " select b.BillId, b.CustomerId, b.BillDate, " +
            " c.Mobile, c.Name, c.Address, m.Item, bi.Quantity, bi.Price, bi.GSTPerc, bi.DiscountPerc " +
            " from Bills b, Customers c, MenuItems m, BillItems bi " +
            " where b.BillId=bi.BillId and m.ItemId=bi.ItemId and c.CustomerId=b.CustomerId and b.BillId=?";

    @Override
    public void start() throws Exception {
        EventBus eventBus = vertx.eventBus();

        eventBus.<JsonObject>consumer(RequestType.CREATE_BILL.name(), message -> {
            getJdbcClient().getConnection(handler -> {
                if (handler.failed()) {
                    message.fail(500, "Couldn't get DB Connections");
                } else {
                    try (SQLConnection connection = handler.result()) {
                        connection.setOptions(new SQLOptions().setAutoGeneratedKeys(true));
                        JsonObject billObj = message.body().getJsonObject("bill");
                        String user = billObj.getString("user");
                        String date = billObj.getString("date");
                        int customerId = billObj.getInteger("customerId");
                        JsonArray billItems = billObj.getJsonArray("billItems");

                        connection.updateWithParams(CREATE_BILL_SQL, new JsonArray().add(customerId).add(user).add(date), bill -> {
                            if (bill.failed()) {
                                message.fail(500, "Failed while creating bill. Please retry");
                            } else {
                                int billId = bill.result().getKeys().getInteger(0);
                                List<JsonArray> params = new ArrayList<JsonArray>();
                                billItems.forEach(itemObj -> {
                                    JsonObject item = (JsonObject) itemObj;
                                    params.add(new JsonArray()
                                                    .add(billId)
                                                    .add(item.getInteger("�temId"))
                                                    .add(item.getInteger("qty"))
                                                    .add(item.getFloat("price"))
                                                    .add(item.getFloat("gst"))
                                                    .add(item.getFloat("discount"))
                                                    .add(item.getString("user"))
                                    );
                                });
                                executeBatchUpdate(CREATE_BILL_ITEM_SQL, params, message);
                            }
                        });
                    } catch (Exception e) {
                        message.fail(500, e.getMessage());
                    }
                }

            });
        });

        eventBus.<JsonObject>consumer(RequestType.GET_BILL_BY_ID.name(), message -> executeGet(GET_BILL_BY_ID_SQL, new JsonArray().add(message.body().getInteger("billId")), message));
    }
}
