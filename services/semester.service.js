const config = require("../configs/app"),
    db = require("../models/Semester"),
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

        if (req.query.semester_id) $where["semester_id"] = req.query.semester_id;

        if (req.query.semester_year) $where["semester_year"] = req.query.semester_year;

        if (req.query.term) $where["term"] = req.query.term;

        if (req.query.round_no) $where["round_no"] = req.query.round_no;

        if (req.query.chairman_id) $where["chairman_id"] = req.query.chairman_id;

        if (req.query.default_request_doc_no)
            $where["default_request_doc_no"] = {
                [Op.like]: "%" + req.query.default_request_doc_no + "%",
            };

        if (req.query.default_request_doc_date)
            $where["default_request_doc_date"] = {
                [Op.like]: "%" + req.query.default_request_doc_date + "%",
            };

        if (req.query.start_date)
            $where["start_date"] = {
                [Op.like]: "%" + req.query.start_date + "%",
            };

        if (req.query.end_date)
            $where["end_date"] = {
                [Op.like]: "%" + req.query.end_date + "%",
            };

        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // Order
        $order = [["semester_id", "ASC"]];

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
                const res = methods.findById(inserted.semester_id);

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
                await db.update(data, { where: { semester_id: id } });
                let res = methods.findById(obj.semester_id);

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
                    where: { semester_id: id },
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
};

module.exports = { ...methods };
