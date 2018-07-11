package com.raga.tools.billing;

import com.raga.tools.billing.service.AdminService;
import com.raga.tools.billing.service.BillingService;
import com.raga.tools.billing.vertical.BillingVertical;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.StaticHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by ragha on 22-04-2018.
 */
public class StartupVerticle extends AbstractVerticle {
    private static final String WEB_ROOT = "web.root";
    private static final String PORT_NO = "web.port";

    private static final Logger LOGGER = LoggerFactory.getLogger(StartupVerticle.class);

    @Override
    public void start() throws Exception {
        JsonObject config = config();

        Router router = Router.router(vertx);

        vertx.deployVerticle(BillingVertical.class, new DeploymentOptions().setConfig(config), handler -> {
            System.out.println("Deployed " + BillingVertical.class.getName());
        });

        router.post("/billing/bills/create").handler(BillingService.createBillHandler());
        router.post("/billing/admin/addItem").handler(AdminService.addMenuItemHandler());

        router.route().handler(StaticHandler.create(config().getString(WEB_ROOT)));

        vertx.createHttpServer().requestHandler(router::accept).listen(config().getInteger(PORT_NO));
        LOGGER.info("Web Server started at port {}", config().getInteger(PORT_NO));
    }
}
