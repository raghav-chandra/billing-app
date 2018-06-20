package com.raga.tools.billing.service;

import com.raga.tools.billing.RequestType;
import com.raga.tools.billing.vertical.AbstractDBVertical;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.sql.ResultSet;
import io.vertx.ext.sql.SQLConnection;

import java.time.Instant;

/**
 * Created by ragha on 22-04-2018.
 */
public class ReportingService extends AbstractDBVertical {

    private static final String GET_BILL_BY_ID_SQL = "select b.BillId, b.CustomerId, b.UpdatedBy, " +
            " mi.Item, mi.Description, mi.Price, bi.Quantity, bi.GSTPerc, bi.DiscountPerc " +
            " from Bills b join Customers c on c.CustomerId=b.CustomerId " +
            " join BillItems bi on bi.BillId=b.BillId join MenuItems mi on mi.ItemId = bi.ItemId " +
            " where b.BillId = ?";

    @Override
    public void start() throws Exception {
        EventBus eventBus = vertx.eventBus();
        eventBus.<JsonObject>consumer(RequestType.GET_BILL_BY_ID.name(), message -> {
            getJdbcClient().getConnection(connHandler -> {
                if (connHandler.failed()) {
                    message.fail(500, "Couldn't get DB Connections");
                } else {
                    try (SQLConnection connection = connHandler.result()) {
                        int billId = message.body().getInteger("billId");
                        connection.queryWithParams(GET_BILL_BY_ID_SQL, new JsonArray().add(billId), queryHandler -> {
                            if (queryHandler.failed()) {
                                message.fail(500, "Failed while getting bill information");
                            } else {
                                ResultSet rs = queryHandler.result();
                                rs.getRows().forEach(row -> {
                                    int custId = row.getInteger("CustomerId");
                                    Instant instant = row.getInstant("UpdatedBy");

                                });
                            }
                        });
                    } catch (Exception e) {
                        message.fail(500, e.getMessage());
                    }
                }
            });
        });
    }
}
