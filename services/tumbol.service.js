const config = require("../configs/app"),
    db = require("../models/Tumbol"),
    {
        ErrorBadRequest,
        ErrorNotFound,
        ErrorUnauthorized,
    } = require("../configs/errorMethods"),
    { Op } = require("sequelize");
const Amphur = require("../models/Amphur");
const Province = require("../models/Province");
const methods = {
    scopeSearch(req, limit, offset) {
        // Where
        $where = {};

        if (req.query.tumbol_id) $where["tumbol_id"] = req.query.tumbol_id;

        if (req.query.tumbol_code)
            $where["tumbol_code"] = {
                [Op.like]: "%" + req.query.tumbol_code + "%",
            };

        if (req.query.name_th)
            $where["name_th"] = {
                [Op.like]: "%" + req.query.name_th + "%",
            };

        if (req.query.name_en)
            $where["name_en"] = {
                [Op.like]: "%" + req.query.name_en + "%",
            };

        if (req.query.amphur_id)
            $where["amphur_id"] = req.query.amphur_id;

        if (req.query.active) $where["active"] = req.query.active;

        if (req.query.created_by) $where["created_by"] = req.query.created_by;

        if (req.query.updated_at) $where["updated_at"] = req.query.updated_at;

        //
        const query = Object.keys($where).length > 0 ? { where: $where } : {};

        // Order
        $order = [["name_th", "ASC"]];

        if (req.query.orderByField && req.query.orderBy)
            $order = [
                [
                    req.query.orderByField,
                    req.query.orderBy.toLowerCase() == "desc" ? "desc" : "asc",
                ],
            ];

        query["order"] = $order;

        query["include"] = [{ all: true, required: false }];

        if (!isNaN(limit)) query["limit"] = limit;

        if (!isNaN(offset)) query["offset"] = offset;

        return { query: query };
    },

    find(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        const _q = methods.scopeSearch(req, limit, offset);

        return new Promise(async (resolve, reject) => {
            try {
                console.log(_q.query)
                Promise.all([db.findAll(_q.query)])
                    .then((result) => {
                        let rows = result[0],
                            count = rows.length;
                        resolve({
                            total: count,
                            lastPage: Math.ceil(count / limit),
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

    findList(req) {
        const limit = +(req.query.size || config.pageLimit);
        const offset = +(limit * ((req.query.page || 1) - 1));
        let _q = methods.scopeSearch(req, limit, offset);

        _q.query["attributes"] = ['tumbol_id', 'name_th', 'postcode'];
        _q.query["include"] = [
            {
                model: Amphur, as: 'amphur',
                attributes: ['amphur_id', 'name_th'],
                include: [
                    {
                        model: Province, as: 'province',
                        attributes: ['province_id', 'name_th']
                    }
                ]
            },
        ];

        return new Promise(async (resolve, reject) => {
            try {
                console.log(_q.query)
                Promise.all([db.findAll(_q.query)])
                    .then((result) => {
                        let rows = result[0],
                            count = rows.length;
                        resolve({
                            total: count,
                            lastPage: Math.ceil(count / limit),
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
                const res = methods.findById(inserted.tumbol_id);

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
                await db.update(data, { where: { tumbol_id: id } });
                let res = methods.findById(obj.tumbol_id);

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
                    where: { tumbol_id: id },
                });

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
};

module.exports = { ...methods };
