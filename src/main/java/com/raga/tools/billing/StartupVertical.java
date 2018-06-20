package com.raga.tools.billing;

import com.raga.tools.billing.service.AdminService;
import com.raga.tools.billing.service.BillingService;
import com.raga.tools.billing.vertical.BillingVertical;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;

/**
 * Created by ragha on 22-04-2018.
 */
public class StartupVertical extends AbstractVerticle {
    private static final String WEB_ROOT = "web.root";

    @Override
    public void start() throws Exception {
        JsonObject config = config();

        Router router = Router.router(vertx);

        vertx.deployVerticle(BillingVertical.class, new DeploymentOptions().setConfig(config), handler -> {
            System.out.println("Deployed " + BillingVertical.class.getName());
        });

        router.post("/billing/bills/create").handler(BillingService.createBillHandler());
        router.post("/billing/admin/addItem").handler(AdminService.addMenuItemHandler());


    }
}
