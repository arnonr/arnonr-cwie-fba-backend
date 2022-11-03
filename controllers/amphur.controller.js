const Service = require("../services/amphur.service"),
    jwt = require("jsonwebtoken");

const methods = {
    async onGetAll(req, res) {
        try {
            let result = await Service.find(req);

            res.success(result);
        } catch (error) {
            res.error(error);
        }
    },

    async onGetById(req, res) {
        try {
            let result = await Service.findById(req.params.id);
            res.success(result);
        } catch (error) {
            res.error(error);
        }
    },

    async onInsert(req, res) {
        try {
            const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
            // console.log(decoded)
            req.body.created_by = decoded.user_id;
            //   req.body.created_by = 1;
            let result = await Service.insert(req.body);

            res.success(result, 201);
        } catch (error) {
            res.error(error);
        }
    },

    async onUpdate(req, res) {
        try {
            const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);
            req.body.updated_by = decoded.id;

            const result = await Service.update(req.params.id, req.body);
            res.success(result);
        } catch (error) {
            res.error(error);
        }
    },

    async onDelete(req, res) {
        try {
            await Service.delete(req.params.id);
            res.success("success", 204);
        } catch (error) {
            res.error(error);
        }
    },
};

module.exports = { ...methods };
