const config = require("../configs/app"),
    db = require("../models/Form"),
    {
        ErrorBadRequest,
        ErrorNotFound,
        ErrorUnauthorized,
    } = require("../configs/errorMethods"),
    { Op } = require("sequelize");

const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.form_id) $where["form_id"] = req.query.form_id;

        if (req.query.supervision_id) $where["supervision_id"] = req.query.supervision_id;

        if (req.query.semester_id) $where["semester_id"] = req.query.semester_id;

        if (req.query.student_id) $where["student_id"] = req.query.student_id;

        if (req.query.company_id) $where["company_id"] = req.query.company_id;

        if (req.query.status_id) $where["status_id"] = req.query.status_id;

        if (req.query.start_date)
            $where["start_date"] = {
                [Op.like]: "%" + req.query.start_date + "%",
            };

        if (req.query.end_date)
            $where["end_date"] = {
                [Op.like]: "%" + req.query.end_date + "%",
            };

        if (req.query.co_name)
            $where["co_name"] = {
                [Op.like]: "%" + req.query.co_name + "%",
            };

        if (req.query.co_position)
            $where["co_position"] = {
                [Op.like]: "%" + req.query.co_position + "%",
            };

        if (req.query.co_tel)
            $where["co_tel"] = {
                [Op.like]: "%" + req.query.co_tel + "%",
            };

        if (req.query.co_email)
            $where["co_email"] = {
                [Op.like]: "%" + req.query.co_email + "%",
            };

        if (req.query.request_name)
            $where["request_name"] = {
                [Op.like]: "%" + req.query.request_name + "%",
            };

        if (req.query.request_position)
            $where["request_position"] = {
                [Op.like]: "%" + req.query.request_position + "%",
            };

        if (req.query.request_document_date)
            $where["request_document_date"] = {
                [Op.like]: "%" + req.query.request_document_date + "%",
            };

        if (req.query.request_document_number)
            $where["request_document_number"] = {
                [Op.like]: "%" + req.query.request_document_number + "%",
            };

        if (req.query.max_response_date)
            $where["max_response_date"] = {
                [Op.like]: "%" + req.query.max_response_date + "%",
            };

        if (req.query.send_document_date)
            $where["send_document_date"] = {
                [Op.like]: "%" + req.query.send_document_date + "%",
            };

        if (req.query.send_document_number)
            $where["send_document_number"] = {
                [Op.like]: "%" + req.query.send_document_number + "%",
            };

        if (req.query.response_province_id) $where["response_province_id"] = req.query.response_province_id;

        if (req.query.reject_status_id) $where["reject_status_id"] = req.query.reject_status_id;

        if (req.query.company_rating) $where["company_rating"] = req.query.company_rating;

        if (req.query.next_coop) $where["next_coop"] = req.query.next_coop;

        if (req.query.active) $where["active"] = req.query.active;

        if (req.query.created_by) $where["created_by"] = req.query.created_by;

        if (req.query.updated_at) $where["updated_at"] = req.query.updated_at;

        //
        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // Order
        $order = [["form_id", "ASC"]];

        if (req.query.orderByField && req.query.orderBy)
            $order = [
                [
                    req.query.orderByField,
                    req.query.orderBy.toLowerCase() == "desc" ? "desc" : "asc",
                ],
            ];
        query["order"] = $order;

        query["include"] = [];
        if (req.query.includeAll) {
            query["include"].unshift({ all: true, required: false });
          }

        // query["include"] = [{ all: true, required: false }];

        // if (!isNaN(limit)) query["limit"] = limit;

        // if (!isNaN(offset)) query["offset"] = offset;

        return { query: query };
    },

    find(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        const _q = methods.scopeSearch(req, limit, offset);
        const _qLimit = {..._q};

        if (!isNaN(limit)) _qLimit.query["limit"] = limit;
        if (!isNaN(offset)) _qLimit.query["offset"] = offset;

        return new Promise(async (resolve, reject) => {
            try {
                Promise.all([
                    db.findAll(_qLimit.query),
                    db.count(_q.query),
                  ])
                    .then((result) => {
                      let rows = result[0];

                      resolve({
                        total: result[1],
                        lastPage: Math.ceil(result[1] / limit),
                        currPage: +req.query.page || 1,
                        rows: rows,
                      });
                    })
                    .catch((error) => {
                      reject(error);
                    });
            } catch (error) {
                reject(error);
            }
        });
    },

    findById(id) {
        return new Promise(async (resolve, reject) => {
            try {

                let obj = await db.findByPk(id, {
                    include: [{ all: true, required: false }],
                });

                if (!obj) reject(ErrorNotFound("id: not found"));

                resolve(obj.toJSON());
            } catch (error) {
                reject(ErrorNotFound(error));
            }
        });
    },

    insert(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const obj = new db(data);
                const inserted = await obj.save();
                const res = methods.findById(inserted.form_id);

                resolve(res);
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },

    update(id, data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Check ID
                const obj = await db.findByPk(id);
                if (!obj) reject(ErrorNotFound("id: not found"));

                // Update
                // data.document_type_id  = parseInt(id);
                await db.update(data, { where: { form_id: id } });
                let res = methods.findById(obj.form_id);

                resolve(res);
            } catch (error) {
                reject(ErrorBadRequest(error.message));
            }
        });
    },

    delete(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const obj = await db.findByPk(id);
                if (!obj) reject(ErrorNotFound("id: not found"));

                await db.destroy({
                    where: { form_id: id },
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
};

module.exports = { ...methods };
