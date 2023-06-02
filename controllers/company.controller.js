const Service = require("../services/company.service"),
    jwt = require("jsonwebtoken");
const upload_folder = "company/";
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

            if(typeof(req.files) != "undefined"){
                if (typeof(req.files['namecard_file_upload']) != "undefined"){
                    req.body.namecard_file = upload_folder + req.files['namecard_file_upload'][0].filename;
                }

                if (typeof(req.files['map_file_upload']) != "undefined"){
                    req.body.map_file = upload_folder + req.files['map_file_upload'][0].filename;
                }
            }

            req.body.created_by = decoded.user_id;
            let result = await Service.insert(req.body);

            res.success(result, 201);
        } catch (error) {
            res.error(error);
        }
    },

    async onUpdate(req, res) {
        try {
            const decoded = jwt.decode(req.headers.authorization.split(" ")[1]);

            // if (typeof(req.file) != "undefined"){
            //     req.body.namecard_file = upload_folder + req.file.filename;
            // }

            if(typeof(req.files) != "undefined"){
                if (typeof(req.files['namecard_file_upload']) != "undefined"){
                    req.body.namecard_file = upload_folder + req.files['namecard_file_upload'][0].filename;
                }

                if (typeof(req.files['map_file_upload']) != "undefined"){
                    req.body.map_file = upload_folder + req.files['map_file_upload'][0].filename;
                }
            }

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
