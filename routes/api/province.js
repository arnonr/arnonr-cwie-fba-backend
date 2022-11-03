const router = require("express").Router();
const controllers = require("../../controllers/province.controller");
const auth = require("../auth");
const { checkPermission } = require("../accessControl");

router.get(
    "/",
    auth.required,
    controllers.onGetAll
);

router.get(
    "/:id",
    auth.required,
    controllers.onGetById
);

router.post(
    "/",
    auth.required,
    controllers.onInsert,
);

router.put(
    "/:id",
    auth.required,
    controllers.onUpdate
);

router.delete(
    "/:id",
    auth.required,
    controllers.onDelete
);

module.exports = router;