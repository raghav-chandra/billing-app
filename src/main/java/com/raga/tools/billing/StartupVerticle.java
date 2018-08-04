package com.raga.tools.billing;

import com.raga.tools.billing.service.AdminService;
import com.raga.tools.billing.service.BillingService;
import com.raga.tools.billing.service.LoginService;
import com.raga.tools.billing.vertical.LoginVertical;
import com.raga.tools.billing.vertical.AdminVertical;
import com.raga.tools.billing.vertical.BillingVertical;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.StaticHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by ragha on 22-04-2018.
 */
public class StartupVerticle extends AbstractVerticle {
    private static final String WEB_ROOT = "web.root";
    private static final String PORT_NO = "web.port";

    private static final Logger LOGGER = LoggerFactory.getLogger(StartupVerticle.class);

    private static final List<Class> VERTICLES = new ArrayList<>();

    static {
        VERTICLES.add(BillingVertical.class);
        VERTICLES.add(AdminVertical.class);
        VERTICLES.add(LoginVerticle.class);
    }


    @Override
    public void start() {
        JsonObject config = config();

        Router router = Router.router(vertx);

        VERTICLES.forEach(verticle -> {
            vertx.deployVerticle(verticle, new DeploymentOptions().setConfig(config), handler -> {
                if (handler.succeeded()) {
                    System.out.println("Deployed " + BillingVertical.class.getName());
                } else {
                    throw new RuntimeException("Failed deployment", handler.cause());
                }
            });
        });

        router.route().handler(BodyHandler.create());

        router.post("/billing/bills/create").handler(BillingService.createBillHandler());
        router.post("/billing/admin/addItem").handler(AdminService.addMenuItemHandler());

        router.get("/billing/bill/:billId").handler(BillingService.getBillByIdHandler());
        router.post("/billing/bills/search").handler(BillingService.getBillByCriteriaH());

        router.post("/billing/login").handler(LoginService.getUserHandler());
        router.post("/billing/login/create").handler(LoginService.createUserHandler());

        router.get("/billing/items/getAll").handler(AdminService.getAllItemsHandler());
        router.get("/billing/configs/getAll").handler(AdminService.getAllConfigsHandler());

        router.route().handler(StaticHandler.create(config().getString(WEB_ROOT)));

        vertx.createHttpServer().requestHandler(router::accept).listen(config().getInteger(PORT_NO));
        LOGGER.info("Web Server started at port {}", config().getInteger(PORT_NO));
    }
}
