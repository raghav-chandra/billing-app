package com.raga.tools.billing.vertical;

import com.raga.tools.billing.RequestType;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

/**
 * Created by ragha on 22-04-2018.
 */
public class AdminVertical extends AbstractDBVertical {
    private static final String CREATE_ITEM_SQL = "insert into MenuItems (Item,Description,Price,Active,UpdatedBy) values (?,?,?,?,?)";
    private static final String CREATE_CUSTOMER = "insert into Customers (MobileNo,Name,Address,UpdatedBy) values (?,?,?,?)";

    private static final String GET_CUSTOMER = "select CustomerId, MobileNo, Name, Address from Customers where MobileNo=?";
    private static final String GET_CONFIGS_SQL = "select ConfigGroup,Config,Value from Configurations where Active='Y'";

    private static final String GET_ALL_ITEMS = "select ItemId, Item, Description, Price, Active from MenuItems where Type='OUT'";

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
            String mobileNo = cust.getString("mobile");
            String name = cust.getString("name");
            String add = cust.getString("address");
            String userId = cust.getString("userId");
            executeGet(GET_CUSTOMER, new JsonArray().add(mobileNo), message, (message12, rows) -> {
                if (rows.isEmpty()) {
                    executeUpdate(CREATE_CUSTOMER, new JsonArray().add(mobileNo).add(name).add(add).add(userId), message12, (message1, id) -> message1.reply(cust.put("customerId", id)));
                } else {
                    JsonObject customer = rows.getJsonObject(0);
                    message.reply(new JsonObject()
                                    .put("mobile", customer.getString("MobileNo"))
                                    .put("name", customer.getString("Name"))
                                    .put("address", customer.getString("Address"))
                                    .put("customerId", customer.getInteger("CustomerId"))
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
