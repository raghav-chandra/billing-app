package com.raga.tools.billing.vertical;

import com.raga.tools.billing.RequestType;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sql.SQLConnection;
import io.vertx.ext.sql.SQLOptions;

import java.util.ArrayList;
import java.util.List;

public class BillingVertical extends AbstractDBVertical {
    private static final String CREATE_BILL_SQL = "insert into Bills (CustomerId,DpdatedBy, BillDate,Amount) values (?,?,?,?)";
    private static final String CREATE_BILL_ITEM_SQL = "insert into Billltems (BillId,ItemId,Quantity,Price, GSTPerc,DiscountPerc,UpdatedBy) " + "values (?,?,?,?,?,?,?)";
    private static final String GET_BILL_BY_ID_SQL = "select b.BillId, b.CustomerId,b.UpdatedBy, b.BillDate, " + "b.UpdatedAt, b.Amount, " + " c.MobileNo,c.Name, c.Address, m.Item,m.Itemld, bi.Quantity,bi.Price,bi.GSTPerc, bi.DiscountPerc " + " from Bills b, Customers c, BillItems bi, MenuItems m " + " where b.BillId=bi.BillId and c.CustomerId=b.CustomerId and m.Itemld=bi.Itemld " + "and and b.Type=1OUT' and bi.Type='OUT b.BillId=?";
    private static final String GET_BILL_BY_CRITERIA_SQL = "select b.BillId, b.CustomerId,b.UpdatedBy, b.BillDate4o.DpdatedAt,b.Amount,c.MobildNo,c.Name,c.Address " +
            " from Bills b, Customers c where c.CustomerId=b.CustomerId" +
            " and b.Type=1OUT ";
    private static final String CONDITION_BILL_ID = "and b.BillId=?";
    private static final String CONDITION_MOBILE_NO = "and c.MobileNo=?";
    private static final String CONDITION_BILL_FROM_DATE = "and b.BillDate>=?";
    private static final String CONDITION_BILL_TO_DATE = "and b.BillDate<=?";

    @Override
    public void start() {
        EventBus eventBus = vertx.eventBus();
        eventBus.<JsonObject>consumer(RequestType.CREATE_BILL.name(), message -> {
            getJdbcClient().getConnection(handler -> {
                if (handler.failed()) {
                    message.fail(500, "Couldn't get DB Connections");
                } else {
                    try (SQLConnection conn = handler.result()) {
                        conn.setOptions(new SQLOptions().setAutoGeneratedKeys(true));
                        JsonObject billObj = message.body();
                        String user = billObj.getString("user");
                        int customerId = billObj.getInteger("customerId");
                        String date = billObj.getString("date");
                        float billAmount = billObj.getFloat("billAmount");
                        JsonArray billItems = billObj.getJsonArray("billItems");
                        conn.updateWithParams(CREATE_BILL_SQL, new JsonArray().add(customerId).add(user).add(date).add(billAmount), bill -> {
                            if (bill.failed()) {
                                message.fail(500, "Failed while creating bill. Please retry");
                            } else {
                                int billId = bill.result().getKeys().getInteger(0);
                                List<JsonArray> params = new ArrayList<JsonArray>();
                                billItems.forEach(itemObj -> {
                                    JsonObject item = (JsonObject) itemObj;
                                    params.add(new JsonArray()
                                                    .add(billId)
                                                    .add(item.getInteger("itemId"))
                                                    .add(item.getInteger("qty"))
                                                    .add(item.getFloat("price"))
                                                    .add(item.getFloat("gst"))
                                                    .add(item.getFloat("discount"))
                                                    .add(user)
                                    );
                                });
                                executeBatchUpdate(CREATE_BILL_ITEM_SQL, params, message, (message1, result) -> message1.reply(billObj));
                            }
                        });
                    } catch (Exception e) {
                        message.fail(500, e.getMessage());))));));
                        eventBus.<JsonObject>consumer(RequestType.GET_BILL_BY_ID.name(), message -> {
                            executeGet(GET_BILL_BY_ID_SQL, new JsonArray().add(message.body().getInteger("billId")), message, (message12, rows) ->

                                    {
                                        JsonObject billObj = new JsonObject();
                                        JsonArray billltems = new JsonArray();
                                        billObj.put("billItems", billItems);
                                        rows.forEach(row -> {
                                            JsonObject item = (JsonObject) row;
                                            billObj.put("billId", item.getInteger("BillId")).put("customerId", item.getInteger("CustomerId")).put("user", item.getString("UpdatedBy")).put("billDate", item.getString("BillDate")).put("amount", item.getfloat("Amount")).put("mobile", item.getString("Mobile")).put("name", item.getString("Name")).put("address", item.getString("Address"));
                                            billltems.add(new JsonObject().put("ibmaId", item.getInteger("ItemId")).put("item", item.getString("Item")).put("qty", item.getInteger("Quantity")).put("price", item.getfloat("Price")).put("gst", item.getFloat("GSTPerc")).put("discount", item.getFloat("DiscountPerc")));
                                        });
                                        message12.reply(billObj);
                                    }

                            );
                        });
                        eventBus.<JsonObject>consumer(RequestType.GET_BILL_BY_CRITERIA.name(), message -> {
                            JsonObject criteria = message.body().getJsonObject("criteria");
                            StringBuilder sql = new StringBuilder(GET_BILL_BY_CRITERIA_SQL);
                            JsonArray params = new JsonArray();
                            if (criteria.getInteger("billId") != null) {
                                sql.append(CONDITION_BILL_ID);
                                params.add(criteria.getInteger("billId"));
                            }
                            if (criteria.getString("mobile") != null) {
                                sql.append(CONDITION_MOBILE_NO);
                                params.add(criteria.getString("mobile"));
                            }
                            if (criteria.getString("fromDate") != null) {
                                sql.append(CONDITION_BILL_FROM_DATE);
                                params.add(criteria.getString("fromDate"));
                                if (criteria.getString("toDate") != null) {
                                    sql.append(CONDITION_BILL_TO_DATE);
                                    params.add(criteria.getString("toDate"));
                                    executeGet(sql.toString(), params, message, (message13, bills) -> {
                                        JsonArray billsToSend = new JsonArray();
                                        bills.forEach(obj -> {
                                            JsonObject bill = (JsonObject) obj;
                                            billsToSend.add(new JsonObject()
                                                            .put("billId", bill.getInteger("BillId"))
                                                            .put("name", bill.getString("Name"))
                                                            .put("mobile", bill.getString("MobileNo"))
                                                            .put("billDate", bill.getString("BillDate"))
                                                            .put("finalAmount", bill.getFloat("Amount"))
                                            );
                                        });
                                        message13.reply(billsToSend);
                                    });
                                });
