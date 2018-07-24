package com.raga.tools.billing.vertical;

import com.raga.tools.billing.RequestType;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

/**
 * Created by ragha on 22-04-2018.
 */
public class AdminVertical extends AbstractDBVertical {
    private static final String CREATE_ITEM_SQL = "insert into MenuItems (Item,Description,Price,Active,UpdatedBy) value (?,?,?,?,?)";
    private static final String CREATE_CUSTOMER = "insert into Customers (MobileNo,Name,Address,UpdatedBy) value (?,?,?,?)";

    private static final String GET_CUSTOMER = "select CustomerId, MobileNo, Name, Address from Customers where MobileNo=?";
    private static final String GET_CONFIGS_SQL = "select ConfigGroup,Config,Value from Configurations where Active=='Y'";

    private static final String GET_ALL_ITEMS = "select ItemId, Item, Description, Price from MenuItems where Active='Y'";

    @Override
    public void start() throws Exception {
        EventBus eventBus = vertx.eventBus();

        eventBus.<JsonObject>consumer(RequestType.CREATE_MENU_ITEM.name(), message -> {
            JsonObject menuItem = message.body().getJsonObject("menuItem");
            String user = menuItem.getString("user");
            String itemName = menuItem.getString("item");
            String desc = menuItem.getString("desc");
            float price = menuItem.getFloat("price");

            JsonArray params = new JsonArray().add(itemName).add(desc).add(price).add("Y").add(user);
            executeUpdate(CREATE_ITEM_SQL, params, message);
        });

        eventBus.<JsonObject>consumer(RequestType.CREATE_GET_CUSTOMERS.name(), message -> {
            JsonObject cust = message.body().getJsonObject("cust");
            String mobile = cust.getString("mobile");
            String name = cust.getString("name");
            String add = cust.getString("address");
            String user = cust.getString("user");
            executeGet(GET_CUSTOMER, new JsonArray().add(mobile), message, (message12, rows) -> {
                if (rows.isEmpty()) {
                    executeUpdate(CREATE_CUSTOMER, new JsonArray().add(mobile).add(name).add(add).add(user), message12, (message1, id) -> message1.reply(cust.put("customerId", id)));
                } else {
                    JsonObject customer = rows.getJsonObject(0);
                    message.reply(new JsonObject()
                                    .put("customerId", customer.getInstant("CustomerId"))
                                    .put("name", customer.getInstant("Name"))
                                    .put("mobile", customer.getInstant("Mobile"))
                                    .put("address", customer.getInstant("Address"))
                    );
                }
            });
        });

        eventBus.<JsonObject>consumer(RequestType.GET_ALL_ITEMS.name(), message -> executeGet(GET_ALL_ITEMS, new JsonArray(), message));

        eventBus.<JsonObject>consumer(RequestType.GET_ALL_CONFIGS.name(), message -> executeGet(GET_CONFIGS_SQL, new JsonArray(), message));


        //Create Config
        eventBus.<JsonObject>consumer(RequestType.CREATE_CONFIG.name(), message -> {
            JsonObject config = message.body().getJsonObject("config");
            String user = config.getString("user");
            String itemName = config.getString("item");
            String desc = config.getString("desc");
            float price = config.getFloat("price");

            JsonArray params = new JsonArray().add(itemName).add(desc).add(price).add("Y").add(user);
            executeUpdate(CREATE_ITEM_SQL, params, message);
        });
    }
}
