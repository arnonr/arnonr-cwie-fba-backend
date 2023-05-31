const config = require("../configs/app"),
    db = require("../models/Visit"),
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

        if (req.query.visit_id) $where["visit_id"] = req.query.visit_id;

        if (req.query.supervision_id) $where["supervision_id"] = req.query.supervision_id;

        if (req.query.form_id) $where["form_id"] = req.query.form_id;

        if (req.query.visit_date)
            $where["visit_date"] = {
                [Op.like]: "%" + req.query.visit_date + "%",
            };

        if (req.query.visit_time)
            $where["visit_time"] = {
                [Op.like]: "%" + req.query.visit_time + "%",
            };

        if (req.query.co_name)
            $where["co_name"] = {
                [Op.like]: "%" + req.query.co_name + "%",
            };

        if (req.query.co_position)
            $where["co_position"] = {
                [Op.like]: "%" + req.query.co_position + "%",
            };

        if (req.query.document_number)
            $where["document_number"] = {
                [Op.like]: "%" + req.query.document_number + "%",
            };

        if (req.query.document_date)
            $where["document_date"] = {
                [Op.like]: "%" + req.query.document_date + "%",
            };

        if (req.query.visit_type) $where["visit_type"] = req.query.visit_type;

        if (req.query.province_id) $where["province_id"] = req.query.province_id;

        if (req.query.amphur_id) $where["amphur_id"] = req.query.amphur_id;

        if (req.query.tumbol_id) $where["tumbol_id"] = req.query.tumbol_id;

        if (req.query.report_status_id) $where["report_status_id"] = req.query.report_status_id;

        if (req.query.visit_expense)
            $where["visit_expense"] = {
                [Op.like]: "%" + req.query.visit_expense + "%",
            };

        if (req.query.travel_expense)
            $where["travel_expense"] = {
                [Op.like]: "%" + req.query.travel_expense + "%",
            };

        if (req.query.active) $where["active"] = req.query.active;

        if (req.query.created_by) $where["created_by"] = req.query.created_by;

        if (req.query.updated_at) $where["updated_at"] = req.query.updated_at;

        //
        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // Order
        $order = [["visit_id", "ASC"]];

        if (req.query.orderByField && req.query.orderBy)
            $order = [
                [
                    req.query.orderByField,
                    req.query.orderBy.toLowerCase() == "desc" ? "desc" : "asc",
                ],
            ];

        query["order"] = $order;

        // query["include"] = [{ all: true, required: false }];

        // if (!isNaN(limit)) query["limit"] = limit;

        // if (!isNaN(offset)) query["offset"] = offset;

        query["include"] = [];
        if (req.query.includeAll) {
          query["include"].unshift({ all: true, required: false });
        }

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
                const res = methods.findById(inserted.visit_id);

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
                await db.update(data, { where: { visit_id: id } });
                let res = methods.findById(obj.visit_id);

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
                    where: { visit_id: id },
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
};

module.exports = { ...methods };
